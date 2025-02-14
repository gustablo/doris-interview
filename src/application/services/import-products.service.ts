import { Inject, Injectable, Logger } from '@nestjs/common';
import { PRODUCT_REPOSITORY, QUEUE_PROVIDER } from '../../constants/tokens';
import { Product, ProductProps } from '../../domain/entities/product.entity';
import { CreateProductError } from '../../domain/errors/create-product.error';
import { QueueProvider } from '../../domain/providers/queue.provider';
import { IProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class ImportProductsService {
  private readonly logger = new Logger(ImportProductsService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private productRepository: IProductRepository,
    @Inject(QUEUE_PROVIDER)
    private queueProvider: QueueProvider,
  ) {}

  async exec(products: Product[]): Promise<void> {
    this.logger.log('Importing products process started');

    const seenIDentifiers = new Set<string>();
    const allIdentifiersFromRequest = new Set(
      products.map((product) => product.props.identifier),
    );

    const existingProducts = await this.productRepository.findMany(
      Array.from(allIdentifiersFromRequest),
    );
    const existingIdentifiers = new Set(
      existingProducts.map((product) => product.props.identifier),
    );

    for (const product of products) {
      if (
        this.wasIdentifierProcessedBefore(
          product.props.identifier,
          seenIDentifiers,
        ) ||
        existingIdentifiers.has(product.props.identifier)
      ) {
        this.logger.warn({
          message: 'Product identified as duplicated: identifier',
          identifier: product.props.identifier,
        });
      } else {
        const created = await this.createProduct({
          ...product.props,
          imageUrl: undefined,
        });
        if (created) {
          await this.publishToProcessQueue(product.props);
        }
      }
    }
  }

  async createProduct(product: ProductProps): Promise<Product | undefined> {
    try {
      const created = await this.productRepository.create(product);
      this.logger.log({ message: 'Product created', product: created?.props });
      return created;
    } catch (error) {
      console.log(error, error.code);
      await this.queueProvider.publishToDLQ(
        { data: product },
        new CreateProductError(),
      );
      this.logger.error({ message: 'Error creating product', product, error });
    }
  }

  async publishToProcessQueue(product: ProductProps) {
    await this.queueProvider.publish({
      data: product,
    });

    this.logger.log({
      message: 'Product sent to process image queue',
      product,
    });
  }

  wasIdentifierProcessedBefore(
    identifier: string,
    seenIdentifiers: Set<string>,
  ) {
    return seenIdentifiers.size == seenIdentifiers.add(identifier).size;
  }
}
