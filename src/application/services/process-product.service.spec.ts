// src/application/services/process-product.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProcessProductService } from './process-product.service';
import {
  COMPRESS_IMAGE_PROVIDER,
  IMAGE_DOWNLOADER_PROVIDER,
  IMAGE_STORAGE_PROVIDER,
  PRODUCT_REPOSITORY,
  QUEUE_PROVIDER,
} from '../../constants/tokens';
import { Product } from '../../domain/entities/product.entity';
import { CompressImageProvider } from '../../domain/providers/compress-image.provider';
import { ImageDownloadProvider } from '../../domain/providers/image-download.provider';
import { ImageStorageProvider } from '../../domain/providers/image-storage.provider';
import { QueueProvider } from '../../domain/providers/queue.provider';
import { IProductRepository } from '../../domain/repositories/product.repository';
import { CompressImageError } from '../../domain/errors/compress-image.error';
import { ImageDownloadError } from '../../domain/errors/image-download.error';
import { ImageUploadError } from '../../domain/errors/image-upload.error';
import { UnknownError } from '../../domain/errors/unknown.error';
import { Logger } from '@nestjs/common';

describe('ProcessProductService', () => {
  let service: ProcessProductService;
  let compressImageProvider: jest.Mocked<CompressImageProvider>;
  let imageDownloadProvider: jest.Mocked<ImageDownloadProvider>;
  let imageStorageProvider: jest.Mocked<ImageStorageProvider>;
  let productRepository: jest.Mocked<IProductRepository>;
  let queueProvider: jest.Mocked<QueueProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessProductService,
        {
          provide: COMPRESS_IMAGE_PROVIDER,
          useValue: {
            compress: jest.fn(),
          },
        },
        {
          provide: IMAGE_STORAGE_PROVIDER,
          useValue: {
            upload: jest.fn(),
          },
        },
        {
          provide: IMAGE_DOWNLOADER_PROVIDER,
          useValue: {
            download: jest.fn(),
          },
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: QUEUE_PROVIDER,
          useValue: {
            publishToDLQ: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProcessProductService>(ProcessProductService);
    compressImageProvider = module.get(COMPRESS_IMAGE_PROVIDER);
    imageDownloadProvider = module.get(IMAGE_DOWNLOADER_PROVIDER);
    imageStorageProvider = module.get(IMAGE_STORAGE_PROVIDER);
    productRepository = module.get(PRODUCT_REPOSITORY);
    queueProvider = module.get(QUEUE_PROVIDER);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exec', () => {
    it('should process product successfully', async () => {
      const product = new Product({
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
      });

      const downloadedImage = {
        buffer: Buffer.from('image-data'),
        fileType: 'jpg',
      };
      const compressedImage = Buffer.from('compressed-image-data');
      const imageUrl = 'https://example.com/compressed-image.jpg';

      imageDownloadProvider.download.mockResolvedValue(downloadedImage);
      compressImageProvider.compress.mockResolvedValue(compressedImage);
      imageStorageProvider.upload.mockResolvedValue(imageUrl);

      await service.exec(product);

      expect(imageDownloadProvider.download).toHaveBeenCalledWith(
        product.props.imageUrl,
      );
      expect(compressImageProvider.compress).toHaveBeenCalledWith(
        downloadedImage.buffer,
        downloadedImage.fileType,
      );
      expect(imageStorageProvider.upload).toHaveBeenCalledWith(
        compressedImage,
        expect.any(String),
        downloadedImage.fileType,
      );
      expect(productRepository.update).toHaveBeenCalledWith(
        product.props.identifier,
        {
          ...product.props,
          imageUrl,
          status: 'PROCESSED',
          active: true,
        },
      );
    });

    it('should handle image download error', async () => {
      const product = new Product({
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
      });

      const error = new ImageDownloadError();
      imageDownloadProvider.download.mockRejectedValue(error);

      await expect(service.exec(product)).rejects.toThrow(ImageDownloadError);

      expect(queueProvider.publishToDLQ).toHaveBeenCalledWith(
        { data: product.props },
        error,
      );
    });

    it('should handle image compress error', async () => {
      const product = new Product({
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
      });

      const downloadedImage = {
        buffer: Buffer.from('image-data'),
        fileType: 'jpg',
      };
      const error = new CompressImageError();

      imageDownloadProvider.download.mockResolvedValue(downloadedImage);
      compressImageProvider.compress.mockRejectedValue(error);

      await expect(service.exec(product)).rejects.toThrow(CompressImageError);

      expect(queueProvider.publishToDLQ).toHaveBeenCalledWith(
        { data: product.props },
        error,
      );
    });

    it('should handle image upload error', async () => {
      const product = new Product({
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
      });

      const downloadedImage = {
        buffer: Buffer.from('image-data'),
        fileType: 'jpg',
      };
      const compressedImage = Buffer.from('compressed-image-data');
      const error = new ImageUploadError();

      imageDownloadProvider.download.mockResolvedValue(downloadedImage);
      compressImageProvider.compress.mockResolvedValue(compressedImage);
      imageStorageProvider.upload.mockRejectedValue(error);

      await expect(service.exec(product)).rejects.toThrow(ImageUploadError);

      expect(queueProvider.publishToDLQ).toHaveBeenCalledWith(
        { data: product.props },
        error,
      );
    });

    it('should handle unknown error', async () => {
      const product = new Product({
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
      });

      const error = new Error('Unknown error');

      imageDownloadProvider.download.mockRejectedValue(error);

      await expect(service.exec(product)).rejects.toThrow(UnknownError);

      expect(queueProvider.publishToDLQ).toHaveBeenCalledWith(
        { data: product.props },
        new UnknownError(error.message),
      );
    });
  });
});
