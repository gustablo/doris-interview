export type DownloadOutput = {
    buffer: Buffer;
    fileType: string;
}

export interface ImageDownloadProvider {
    download(url: string): Promise<DownloadOutput>;
}