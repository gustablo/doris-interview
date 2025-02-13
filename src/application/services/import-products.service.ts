import { Inject, Injectable, Logger } from '@nestjs/common';
import { PRODUCT_REPOSITORY, QUEUE_PROVIDER } from 'src/constants/tokens';
import { Product, ProductProps } from 'src/domain/entities/product.entity';
import { CreateProductError } from 'src/domain/errors/create-product.error';
import { DuplicatedIdentifierError } from 'src/domain/errors/duplicated-identifier.error';
import { QueueProvider } from 'src/domain/providers/queue.provider';
import { IProductRepository } from 'src/domain/repositories/product.repository';

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

    for (const product of products) {
      if (
        this.wasIdentifierProcessedBefore(
          product.props.identifier,
          seenIDentifiers,
        )
      ) {
        this.logger.warn({
          message: 'Product identified as duplicated: identifier',
          identifier: product.props.identifier,
        });
        await this.queueProvider.publishToDLQ(
          { data: product.props },
          new DuplicatedIdentifierError(),
        );
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

  private async createProduct(
    product: ProductProps,
  ): Promise<Product | undefined> {
    try {
      const created = await this.productRepository.create(product);
      this.logger.log({ message: 'Product created', product: created?.props });
      return created;
    } catch (error) {
      await this.queueProvider.publishToDLQ(
        { data: product },
        new CreateProductError(),
      );
      this.logger.error({ message: 'Error creating product', product, error });
    }
  }

  private async publishToProcessQueue(product: ProductProps) {
    await this.queueProvider.publish({
      data: product,
    });

    this.logger.log({
      message: 'Product sent to process image queue',
      product,
    });
  }

  private wasIdentifierProcessedBefore(
    identifier: string,
    seenIdentifiers: Set<string>,
  ) {
    return seenIdentifiers.size == seenIdentifiers.add(identifier).size;
  }
}
