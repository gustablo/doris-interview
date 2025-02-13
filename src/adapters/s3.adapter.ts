import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { ImageStorageProvider } from '../domain/providers/image-storage.provider';
import { LocalStorageAdapter } from './local-storage.adapter';
import { ImageUploadError } from '../domain/errors/image-upload.error';

@Injectable()
export class S3Service implements ImageStorageProvider {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private s3: AWS.S3;
  private bucketName = process.env.AWS_S3_BUCKET_NAME!;

  constructor() {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async upload(
    buffer: Buffer,
    filename: string,
    extension: string,
  ): Promise<string> {
    const key = `uploads/${randomUUID()}-${filename}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/' + extension,
      ACL: 'public-read',
    };

    try {
      let s3Response = await this.s3.upload(uploadParams).promise();
      return `https://${s3Response.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Response.Key}`;
    } catch (e) {
      this.logger.error({ message: 'Error uploading image to s3', error: e });
      throw new ImageUploadError();
    }
  }
}
