import { Injectable, Logger } from "@nestjs/common";
import sharp from "sharp";
import { CompressImageError } from "src/domain/errors/compress-image.error";
import { CompressImageProvider } from "src/domain/providers/compress-image.provider";

@Injectable()
export class SharpAdapter implements CompressImageProvider {
    private readonly logger = new Logger(SharpAdapter.name); 

    async compress(buffer: Buffer, format: string): Promise<Buffer> {
        try {
            const sharpInstance = sharp(buffer);

            const formats = {
                "jpg": () => sharpInstance.jpeg({ mozjpeg: true, quality: 70 }),
                "jpeg": () => sharpInstance.jpeg({ mozjpeg: true, quality: 70 }),
                "png": () => sharpInstance.png({ quality: 70 })
            }

            const compressed = await formats[format]().toBuffer();
            return compressed;     
        } catch (error) {
            this.logger.error({message: "Error compressing image", error});
            throw new CompressImageError();
        }
    }

}
