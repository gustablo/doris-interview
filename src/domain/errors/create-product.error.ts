import { BaseError } from './base.error';

export class CreateProductError extends BaseError {
  constructor() {
    super('Error saving product');
  }
}
