import { BaseError } from './base.error';

export class UnknownError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}
