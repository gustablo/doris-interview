import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PRODUCT_PROCESSOR_DLQ_QUEUE_NAME } from 'src/constants/queue';
import { PRODUCT_REPOSITORY } from 'src/constants/tokens';
import { ProductProps } from 'src/domain/entities/product.entity';
import { IProductRepository } from 'src/domain/repositories/product.repository';

@Processor(PRODUCT_PROCESSOR_DLQ_QUEUE_NAME)
export class ProcessProductDLQConsumer extends WorkerHost {
  private readonly logger = new Logger(ProcessProductDLQConsumer.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY) private productRepository: IProductRepository,
  ) {
    super();
  }

  async process(
    job: Job<ProductProps & { reason: string }, any, string>,
  ): Promise<any> {
    this.logger.log({
      message: 'Processing DLQ job',
      job: job.id,
      data: job.data,
    });

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
