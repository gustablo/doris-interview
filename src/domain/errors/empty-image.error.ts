import { BaseError } from "./base.error";

export class EmptyImageError extends BaseError {
    constructor() {
        super('Empty image');
    }
}