import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { PRODUCT_PROCESSOR_DLQ_QUEUE_NAME, PRODUCT_PROCESSOR_QUEUE_NAME } from "src/constants/queue";
import { BaseError } from "src/domain/errors/base.error";
import { PublishProps, QueueProvider } from "src/domain/providers/queue.provider";

@Injectable()
export class BullMQAdapter implements QueueProvider {
    private readonly logger = new Logger(BullMQAdapter.name);

    constructor(
        @InjectQueue(PRODUCT_PROCESSOR_QUEUE_NAME)
        private readonly productProcessorQueue: Queue,
        @InjectQueue(PRODUCT_PROCESSOR_DLQ_QUEUE_NAME)
        private readonly productProcessorDLQ: Queue)
     {}

    async publish(props: PublishProps): Promise<void> {
        try {
            await this.productProcessorQueue.add(props.data.identifier, props.data);
            this.logger.log({ message: 'Product sent to product-processor queue', product: props.data });
        } catch(error) {
            this.logger.error({ message: 'Error publishing to product-processor queue', error });
        }
    }

    async publishToDLQ(props: PublishProps, reason: BaseError): Promise<void> {
        try {
            await this.productProcessorDLQ.add(props.data.identifier, { reason: reason.message, ...props.data });
            this.logger.log({ message: 'Product sent to product-processor-dlq queue', product: props.data });
        } catch(error) {
            this.logger.error({ message: 'Error publishing to product-processor-dlq queue', error });
        }
    }

}
