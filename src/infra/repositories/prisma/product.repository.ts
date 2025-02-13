import { Product, ProductProps } from 'src/domain/entities/product.entity';
import { IProductRepository } from 'src/domain/repositories/product.repository';
import { ProductMapper } from '../mappers/product.mapper';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/repositories/database/prisma.config';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async create(product: ProductProps): Promise<Product> {
    const created = await this.prisma.product.create({
      data: ProductMapper.toPersistence(product),
    });

    return ProductMapper.toDomain(created);
  }

  async update(id: string, product: Partial<ProductProps>): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: {
        identifier: id,
      },
      data: ProductMapper.toPersistence(product),
    });

    return ProductMapper.toDomain(updated);
  }
}
