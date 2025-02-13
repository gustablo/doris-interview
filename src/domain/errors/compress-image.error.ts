import { BaseError } from './base.error';

export class CompressImageError extends BaseError {
  constructor() {
    super('Error compressing image');
  }
}
