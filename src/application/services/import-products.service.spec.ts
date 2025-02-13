// src/application/services/import-products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ImportProductsService } from './import-products.service';
import { PRODUCT_REPOSITORY, QUEUE_PROVIDER } from '../../constants/tokens';
import { Product } from '../../domain/entities/product.entity';
import { ProductProps } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository';
import { QueueProvider } from '../../domain/providers/queue.provider';
import { DuplicatedIdentifierError } from '../../domain/errors/duplicated-identifier.error';
import { CreateProductError } from '../../domain/errors/create-product.error';
import { Logger } from '@nestjs/common';

describe('ImportProductsService', () => {
  let service: ImportProductsService;
  let productRepository: jest.Mocked<IProductRepository>;
  let queueProvider: jest.Mocked<QueueProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportProductsService,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: QUEUE_PROVIDER,
          useValue: {
            publishToDLQ: jest.fn(),
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImportProductsService>(ImportProductsService);
    productRepository = module.get(PRODUCT_REPOSITORY);
    queueProvider = module.get(QUEUE_PROVIDER);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exec', () => {
    it('should import products without duplicates', async () => {
      const products = [
        new Product({
          identifier: '123',
          name: 'Product 1',
          listPrice: 100,
          sellingPrice: 90,
          imageUrl: 'https://example.com/image.jpg',
          category: 'TOP',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'PROCESSING',
          active: false,
        }),
      ];

      productRepository.create.mockResolvedValue(products[0]);

      await service.exec(products);

      expect(productRepository.create).toHaveBeenCalledWith({
        identifier: '123',
        name: 'Product 1',
        listPrice: 100,
        sellingPrice: 90,
        imageUrl: undefined,
      });

      expect(queueProvider.publish).toHaveBeenCalledWith({
        data: products[0].props,
      });

      expect(queueProvider.publishToDLQ).not.toHaveBeenCalled();
    });

    it('should send duplicated products to DLQ', async () => {
      const products = [
        new Product({
          identifier: '123',
          name: 'Product 1',
          listPrice: 100,
          sellingPrice: 90,
          imageUrl: 'https://example.com/image.jpg',
          category: 'TOP',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'PROCESSING',
          active: false,
        }),
        new Product({
          identifier: '123',
          name: 'Product 1',
          listPrice: 100,
          sellingPrice: 90,
          imageUrl: 'https://example.com/image.jpg',
          category: 'TOP',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'PROCESSING',
          active: false,
        }),
      ];

      productRepository.create.mockResolvedValue(products[0]);

      await service.exec(products);

      expect(queueProvider.publishToDLQ).toHaveBeenCalledWith(
        { data: products[1].props },
        new DuplicatedIdentifierError(),
      );

      expect(queueProvider.publish).toHaveBeenCalledTimes(1); // Apenas o primeiro produto é processado
    });

    it('should handle errors when creating a product', async () => {
      const products = [
        new Product({
          identifier: '123',
          name: 'Product 1',
          listPrice: 100,
          sellingPrice: 90,
          imageUrl: 'https://example.com/image.jpg',
          category: 'TOP',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'PROCESSING',
          active: false,
        }),
      ];

      const error = new Error('Database error');
      productRepository.create.mockRejectedValue(error);

      await service.exec(products);

      expect(queueProvider.publishToDLQ).toHaveBeenCalledWith(
        { data: products[0].props },
        new CreateProductError(),
      );

      expect(queueProvider.publish).not.toHaveBeenCalled();
    });
  });

  describe('publishToProcessQueue', () => {
    it('should publish product to process queue', async () => {
      const productProps: ProductProps = {
        identifier: '123',
        name: 'Product 1',
        listPrice: 100,
        sellingPrice: 90,
        imageUrl: 'https://example.com/image.jpg',
        category: 'TOP',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'PROCESSING',
        active: false,
      };

      await service.publishToProcessQueue(productProps);

      expect(queueProvider.publish).toHaveBeenCalledWith({
        data: productProps,
      });
    });
  });

  describe('wasIdentifierProcessedBefore', () => {
    it('should return true if identifier was processed before', () => {
      const seenIdentifiers = new Set<string>(['123']);
      const result = service.wasIdentifierProcessedBefore(
        '123',
        seenIdentifiers,
      );
      expect(result).toBe(true);
    });

    it('should return false if identifier was not processed before', () => {
      const seenIdentifiers = new Set<string>();
      const result = service.wasIdentifierProcessedBefore(
        '123',
        seenIdentifiers,
      );
      expect(result).toBe(false);
    });
  });
});
