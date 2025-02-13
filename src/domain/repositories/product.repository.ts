import { Product, ProductProps } from '../entities/product.entity';

export interface IProductRepository {
  create(product: ProductProps): Promise<Product>;
  update(identifier: string, product: Partial<ProductProps>): Promise<Product>;
}
