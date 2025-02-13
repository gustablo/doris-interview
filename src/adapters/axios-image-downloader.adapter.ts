import { Injectable, Logger } from '@nestjs/common';
import {
  DownloadOutput,
  ImageDownloadProvider,
} from '../domain/providers/image-download.provider';
import axios from 'axios';
import { ImageDownloadError } from '../domain/errors/image-download.error';

@Injectable()
export class AxiosImageDownloaderAdapter implements ImageDownloadProvider {
  private readonly logger = new Logger(AxiosImageDownloaderAdapter.name);

  async download(url: string): Promise<DownloadOutput> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      const buffer = Buffer.from(response.data);

      let fileType = 'unknown';
      if (buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') {
        fileType = 'png';
      }

      if (buffer.toString('hex', 0, 2) === 'ffd8') {
        fileType = 'jpg';
      }

      return {
        buffer,
        fileType,
      };
    } catch (error) {
      this.logger.error({ message: 'Error downloading image', error });
      throw new ImageDownloadError();
    }
  }
}
