import { Inject, Injectable, Logger } from "@nestjs/common";
import { COMPRESS_IMAGE_PROVIDER, IMAGE_DOWNLOADER_PROVIDER, IMAGE_STORAGE_PROVIDER, PRODUCT_REPOSITORY, QUEUE_PROVIDER } from "src/constants/tokens";
import { Product } from "src/domain/entities/product.entity";
import { CompressImageError } from "src/domain/errors/compress-image.error";
import { ImageDownloadError } from "src/domain/errors/image-download.error";
import { ImageUploadError } from "src/domain/errors/image-upload.error";
import { UnknownError } from "src/domain/errors/unknown.error";
import { CompressImageProvider } from "src/domain/providers/compress-image.provider";
import { ImageDownloadProvider } from "src/domain/providers/image-download.provider";
import { ImageStorageProvider } from "src/domain/providers/image-storage.provider";
import { QueueProvider } from "src/domain/providers/queue.provider";
import { IProductRepository } from "src/domain/repositories/product.repository";

@Injectable()
export class ProcessProductService {
    private readonly logger = new Logger(ProcessProductService.name);

    constructor(
        @Inject(COMPRESS_IMAGE_PROVIDER) private compressImageProvider: CompressImageProvider,
        @Inject(IMAGE_STORAGE_PROVIDER) private imageStorageProvider: ImageStorageProvider,
        @Inject(IMAGE_DOWNLOADER_PROVIDER) private imageDownloadProvider: ImageDownloadProvider,
        @Inject(PRODUCT_REPOSITORY) private productRepository: IProductRepository,
        @Inject(QUEUE_PROVIDER) private queueProvider: QueueProvider,
    ) {}

    async exec(product: Product) {
        try {
            const downloadedImage = await this.imageDownloadProvider.download(product.props.imageUrl!);
            const compressedImage = await this.compressImageProvider.compress(downloadedImage.buffer, downloadedImage.fileType);
            const imageUrl = await this.imageStorageProvider.upload(
                compressedImage,
                this.productNameToFileName(product.props.name),
                downloadedImage.fileType
            );

            await this.productRepository.update(product.props.identifier, {
                ...product.props,
                imageUrl,
                status: 'PROCESSED',
                active: true,
            });

        } catch(error) {
            await this.handleErrors(error, product);
        }
   }

    private productNameToFileName(name: string): string {
        return name
            .toLowerCase()
            .normalize("NFD") // Remove accents
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .replace(/\s+/g, "-") // Replace spaces with spaces
            .replace(/[^a-z0-9-]/g, "") // Remove special characters
            .replace(/--+/g, "-") // Avoid multiple - 
            .trim() + '-' + Date.now();
    }

   private async handleErrors(error: any, product: Product) {
        const possibleErrorInstances = [CompressImageError, ImageDownloadError, ImageUploadError];
        for (const errorInstance of possibleErrorInstances) {
            if (error instanceof errorInstance) {
                this.logger.error({ message: 'Error processing product', product: product.props, error });
                await this.queueProvider.publishToDLQ({ data: product.props }, error);
                throw error;
            }
        }

        this.logger.error({ message: 'Unknown error processing product', product: product.props, error });
        await this.queueProvider.publishToDLQ({ data: product.props }, new UnknownError(error.message));
        throw new UnknownError(error.message);
   }
}
