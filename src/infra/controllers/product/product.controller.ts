import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ImportProductsService } from '../../../application/services/import-products.service';
import {
  ImportProductCollectionDTO,
  ImportProductDTO,
} from '../dtos/import-product.dto';
import { ApiKeyGuard } from '../../../infra/middleware/auth.guard';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('products')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
export class ProductController {
  constructor(private importProductsService: ImportProductsService) {}

  @Post('imports')
  @HttpCode(200)
  async importProducts(@Body() data: ImportProductCollectionDTO) {
    try {
      await this.importProductsService.exec(
        ImportProductDTO.toDomainCollection(data.products),
      );
      return { message: 'Products are being imported in background' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
