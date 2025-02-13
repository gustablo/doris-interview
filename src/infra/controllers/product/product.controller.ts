import { Body, Controller, HttpCode, InternalServerErrorException, Post, UseGuards } from '@nestjs/common';
import { ImportProductsService } from 'src/application/services/import-products.service';
import { ImportProductCollectionDTO, ImportProductDTO } from '../dtos/import-product.dto';
import { ApiKeyGuard } from 'src/infra/middleware/auth.guard';

@Controller('products')
@UseGuards(ApiKeyGuard)
export class ProductController {
    constructor(
        private importProductsService: ImportProductsService,
    ) {}

    @Post('imports')
    @HttpCode(200)
    async importProducts(@Body() products: ImportProductCollectionDTO) {
        try {
            await this.importProductsService.exec(ImportProductDTO.toDomainCollection(products.products));
            return { message: 'Products are being imported in background' };
        } catch(error) {
           throw new InternalServerErrorException();
        }
    }
}
