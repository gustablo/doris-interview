import { BaseError } from './base.error';

export class ImageDownloadError extends BaseError {
  constructor() {
    super('Error downloading image');
  }
}
