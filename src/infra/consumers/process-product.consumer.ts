import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessProductService } from 'src/application/services/process-product.service';
import { PRODUCT_PROCESSOR_QUEUE_NAME } from 'src/constants/queue';
import { Product, ProductProps } from 'src/domain/entities/product.entity';

@Processor(PRODUCT_PROCESSOR_QUEUE_NAME)
export class ProcessProductConsumer extends WorkerHost {
    private readonly logger = new Logger(ProcessProductConsumer.name);

    constructor(private processProductService: ProcessProductService) {
        super();
    }

    async process(job: Job<ProductProps, any, string>): Promise<any> {
        this.logger.log({ message: 'Processing job', job: job.id });

        try {
            await this.processProductService.exec(new Product(job.data));
            this.logger.log({ message: 'Product processed', product: job.data });
            return 'processed';
        } catch (error) {
            this.logger.log({ message: 'Error processing product', error });
            return 'failed';
        }
    }
}
