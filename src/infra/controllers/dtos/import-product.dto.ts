import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsString, IsUrl, MaxLength, Min, ValidateNested } from "class-validator";
import { Product } from "src/domain/entities/product.entity";

export class ImportProductDTO {
    @ApiProperty({
        description: 'Unique identifier of the product',
        example: '35838_10YI'
    })
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @ApiProperty({
        description: 'Name of the product',
        example: 'Camiseta em interlock'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string;

    @ApiProperty({
        description: 'URL of the product image',
        example: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/783px-Test-Logo.svg.png'
    })
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(255)
    image_url: string;

    @ApiProperty({
        description: 'Price of the product in the list',
        example: 100.00
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    @Min(0)
    list_price: number;

    @ApiProperty({
        description: 'Price of the product in the list',
        example: 100.00
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    @Min(0)
    selling_price: number;

    @ApiProperty({
        description: 'Category of the product',
        example: 'TOP',
        enum: ['TOP', 'BOTTOM']
    })
    @IsNotEmpty()
    @IsIn(['TOP', 'BOTTOM'])
    category: 'TOP' | 'BOTTOM';

    static toDomain(importProduct: ImportProductDTO): Product {
        return Product.buildDefaultProduct({
            identifier: importProduct.identifier,
            name: importProduct.name,
            listPrice: importProduct.list_price,
            sellingPrice: importProduct.selling_price,
            category: importProduct.category,
            imageUrl: importProduct.image_url,
        })
    }

    static toDomainCollection(importProducts: ImportProductDTO[]): Product[] {
        return importProducts.map(ImportProductDTO.toDomain);
    }
}

export class ImportProductCollectionDTO {
    @ApiProperty({ isArray: true, type: ImportProductDTO, required: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImportProductDTO)
    products: ImportProductDTO[];
  }
  