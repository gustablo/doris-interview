import { ProductProps } from '../entities/product.entity';
import { BaseError } from '../errors/base.error';

export interface PublishProps {
  data: ProductProps;
}

export interface QueueProvider {
  publish(data: PublishProps): Promise<void>;
  publishToDLQ(data: PublishProps, reason: BaseError): Promise<void>;
}
