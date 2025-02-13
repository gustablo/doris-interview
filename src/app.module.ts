import { Module } from '@nestjs/common';
import { ImportProductsService } from './application/services/import-products.service';
import { PrismaProductRepository } from './infra/repositories/prisma/product.repository';
import { BullMQAdapter } from './adapters/bullmq.adapter';
import {
  COMPRESS_IMAGE_PROVIDER,
  IMAGE_DOWNLOADER_PROVIDER,
  IMAGE_STORAGE_PROVIDER,
  PRODUCT_REPOSITORY,
  QUEUE_PROVIDER,
} from './constants/tokens';
import { ProductController } from './infra/controllers/product/product.controller';
import { PrismaService } from './infra/repositories/database/prisma.config';
import { BullModule } from '@nestjs/bullmq';
import { ProcessProductConsumer } from './infra/consumers/process-product.consumer';
import { ProcessProductDLQConsumer } from './infra/consumers/process-product-dlq.consumer';
import { ProcessProductService } from './application/services/process-product.service';
import { AxiosImageDownloaderAdapter } from './adapters/axios-image-downloader.adapter';
import { SharpAdapter } from './adapters/sharp.adapter';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'product-processor',
    }),
    BullModule.registerQueue({
      name: 'product-processor-dlq',
    }),
  ],
  controllers: [ProductController],
  providers: [
    ImportProductsService,
    ProcessProductService,
    PrismaService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: QUEUE_PROVIDER,
      useClass: BullMQAdapter,
    },
    {
      provide: IMAGE_DOWNLOADER_PROVIDER,
      useClass: AxiosImageDownloaderAdapter,
    },
    {
      provide: COMPRESS_IMAGE_PROVIDER,
      useClass: SharpAdapter,
    },
    {
      provide: IMAGE_STORAGE_PROVIDER,
      useClass: LocalStorageAdapter,
    },
    ProcessProductConsumer,
    ProcessProductDLQConsumer,
  ],
})
export class AppModule {}
