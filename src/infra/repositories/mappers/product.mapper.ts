import { Product as PrismaProduct } from '@prisma/client';
import { Product, ProductProps } from '../../../domain/entities/product.entity';

export class ProductMapper {
  static toDomain(prismaProduct: PrismaProduct): Product {
    return new Product(
      {
        identifier: prismaProduct.identifier,
        name: prismaProduct.name,
        active: prismaProduct.active,
        imageUrl: prismaProduct.image_url!,
        listPrice: prismaProduct.list_price,
        sellingPrice: prismaProduct.selling_price,
        status: prismaProduct.status,
        category: prismaProduct.category,
        errorMessage: prismaProduct.error_message!,
        createdAt: prismaProduct.created_at,
        updatedAt: prismaProduct.updated_at,
      },
      prismaProduct.id,
    );
  }

  static toPersistence(
    product: Partial<ProductProps>,
    id?: number,
  ): PrismaProduct {
    return {
      id: id!,
      identifier: product.identifier!,
      name: product.name!,
      active: product.active!,
      image_url: product.imageUrl!,
      list_price: product.listPrice! * 100,
      selling_price: product.sellingPrice! * 100,
      status: product.status!,
      category: product.category!,
      error_message: product.errorMessage!,
      created_at: product.createdAt!,
      updated_at: product.updatedAt!,
    };
  }
}
