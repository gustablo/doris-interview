import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PRODUCT_PROCESSOR_DLQ_QUEUE_NAME } from '../../constants/queue';
import { PRODUCT_REPOSITORY } from '../../constants/tokens';
import { ProductProps } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository';

@Processor(PRODUCT_PROCESSOR_DLQ_QUEUE_NAME)
export class ProcessProductDLQConsumer extends WorkerHost {
  private readonly logger = new Logger(ProcessProductDLQConsumer.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY) private productRepository: IProductRepository,
  ) {
    super();
  }

  async process(
    job: Job<ProductProps & { reason: string, shouldSave: boolean }, any, string>,
  ): Promise<any> {
    this.logger.log({
      message: 'Processing DLQ job',
      job: job.id,
      data: job.data,
    });

    if (!job.data.shouldSave) {
      this.logger.log({ message: 'Product skipped from processing', product: job.data })
      return;
    }

    try {
      const updated = await this.productRepository.update(job.data.identifier, {
        ...job.data,
        status: 'PROCESSED_ERROR',
        errorMessage: job.data.reason,
      });

      this.logger.log({ message: 'Product updated on DLQ', product: updated });
      return job.data;
    } catch (error) {
      this.logger.error({ message: 'Error processing DLQ job', error });
      return 'failed';
    }
  }
}
