import { BaseError } from './base.error';

export class DuplicatedIdentifierError extends BaseError {
  constructor() {
    super('Duplicated identifier');
  }
}
