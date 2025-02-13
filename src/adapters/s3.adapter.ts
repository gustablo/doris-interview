import { Injectable } from "@nestjs/common";
import { ImageStorageProvider } from "src/domain/providers/image-storage.provider";

@Injectable()
export class S3Adapter implements ImageStorageProvider {
    upload(buffer: Buffer, filename: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

}