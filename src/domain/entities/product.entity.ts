import { BaseEntity } from "./base.entity";

export interface ProductProps {
    identifier: string;
    name: string;
    active: boolean;
    imageUrl?: string;
    listPrice: number;
    sellingPrice: number;
    status: 'PROCESSING' | 'PROCESSED_ERROR' | 'PROCESSED';
    category: 'TOP' | 'BOTTOM';
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

type InitialProductProps = Pick<ProductProps, 'identifier' | 'name' | 'listPrice' | 'sellingPrice' | 'category' | 'imageUrl'>;

export class Product extends BaseEntity<ProductProps>{

    static buildDefaultProduct(props: InitialProductProps): Product {
        return new this({
            identifier: props.identifier,
            name: props.name,
            listPrice: props.listPrice,
            sellingPrice: props.sellingPrice,
            category: props.category,
            active: false,
            imageUrl: props.imageUrl,
            status: 'PROCESSING',
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }


    processedError(errorMessage: string) {
        this.props.status = 'PROCESSED_ERROR';
        this.props.errorMessage = errorMessage;
    }

    successfullyProcessed() {
        this.props.status = 'PROCESSED';
    }
}
