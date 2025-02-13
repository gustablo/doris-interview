import { Test, TestingModule } from '@nestjs/testing';
import { ProcessProductConsumer } from './process-product.consumer';
import { ProcessProductService } from '../../application/services/process-product.service';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Product, ProductProps } from '../../domain/entities/product.entity';

describe('ProcessProductConsumer', () => {
  let consumer: ProcessProductConsumer;
  let processProductService: ProcessProductService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessProductConsumer,
        {
          provide: ProcessProductService,
          useValue: {
            exec: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    consumer = module.get<ProcessProductConsumer>(ProcessProductConsumer);
    processProductService = module.get<ProcessProductService>(ProcessProductService);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('process', () => {
    it('should process the job successfully', async () => {
      const job = {
        id: '1',
        data: {
            identifier: '123',
            name: 'Product 1',
            listPrice: 100,
            sellingPrice: 90,
            imageUrl: 'https://example.com/image.jpg',
            active: false,
            category: 'TOP',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'PROCESSING',
        },
      } as Job<ProductProps, any, string>;

      jest.spyOn(processProductService, 'exec').mockResolvedValue(undefined);

      const result = await consumer.process(job);

      expect(processProductService.exec).toHaveBeenCalledWith(new Product(job.data));
      expect(result).toBe('processed');
    });

    it('should handle errors when processing the job', async () => {
      const job = {
        id: '1',
        data: {
            identifier: '123',
            name: 'Product 1',
            listPrice: 100,
            sellingPrice: 90,
            imageUrl: 'https://example.com/image.jpg',
            active: false,
            category: 'TOP',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'PROCESSING',
        },
      } as Job<ProductProps, any, string>;

      const error = new Error('Processing failed');
      jest.spyOn(processProductService, 'exec').mockRejectedValue(error);

      const result = await consumer.process(job);

      expect(processProductService.exec).toHaveBeenCalledWith(new Product(job.data));
      expect(result).toBe('failed');
    });
  });
});