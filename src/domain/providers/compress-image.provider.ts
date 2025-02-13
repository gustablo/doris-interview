export interface CompressImageProvider {
    compress(buffer: Buffer, format: string): Promise<Buffer>;
}
