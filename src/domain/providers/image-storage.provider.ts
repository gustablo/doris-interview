export interface ImageStorageProvider {
    upload(buffer: Buffer, filename: string, extension: string): Promise<string>;
}
