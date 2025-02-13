import { Injectable, Logger } from "@nestjs/common";
import { ImageStorageProvider } from "src/domain/providers/image-storage.provider";
import fs from "fs";
import path from "path";
import { ImageUploadError } from "src/domain/errors/image-upload.error";

@Injectable()
export class LocalStorageAdapter implements ImageStorageProvider {
    private readonly logger = new Logger(LocalStorageAdapter.name);
    private FOLDER_PATH = "/app/uploads";

    async upload(buffer: Buffer, filename: string, extension: string): Promise<string> {
        try {
            fs.mkdirSync(this.FOLDER_PATH, { recursive: true });

            const filePath = path.join(this.FOLDER_PATH, `${filename}.${extension}`);

            fs.writeFileSync(filePath, buffer);

            this.logger.log(`Image saved to: ${filePath}`);
            return filePath;
        } catch (error) {
            this.logger.error({ message: 'Error saving image', error });
            throw new ImageUploadError();
        }

    }

}
