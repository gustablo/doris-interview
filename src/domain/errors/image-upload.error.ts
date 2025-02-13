import { BaseError } from "./base.error";

export class ImageUploadError extends BaseError {
    constructor() {
        super('Error uploading image');
    }
}
