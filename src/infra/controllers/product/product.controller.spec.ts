// src/product/product.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ImportProductsService } from '../../../application/services/import-products.service';
import { ApiKeyGuard } from '../../../infra/middleware/auth.guard';
import { ImportProductCollectionDTO } from '../dtos/import-product.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let importProductsService: ImportProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ImportProductsService,
          useValue: {
            exec: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<ProductController>(ProductController);
    importProductsService = module.get<ImportProductsService>(
      ImportProductsService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importProducts', () => {
    it('should return a success message when products are imported', async () => {
      jest.spyOn(importProductsService, 'exec').mockResolvedValue(undefined);

      const products: ImportProductCollectionDTO = {
        products: [
          {
            identifier: '123',
            name: 'Product 1',
            list_price: 100,
            selling_price: 90,
            category: 'TOP',
            image_url: 'https://example.com/image.jpg',
          },
        ],
      };

      const result = await controller.importProducts(products);

      expect(result).toEqual({
        message: 'Products are being imported in background',
      });

      expect(importProductsService.exec).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            props: expect.objectContaining({
              identifier: '123',
              name: 'Product 1',
              listPrice: 100,
              sellingPrice: 90,
              imageUrl: 'https://example.com/image.jpg',
            }),
          }),
        ]),
      );
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      jest
        .spyOn(importProductsService, 'exec')
        .mockRejectedValue(new Error('Service error'));

      const products: ImportProductCollectionDTO = {
        products: [
          {
            identifier: '123',
            name: 'Product 1',
            list_price: 100,
            selling_price: 90,
            image_url: 'https://example.com/image.jpg',
            category: 'TOP',
          },
        ],
      };

      await expect(controller.importProducts(products)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
