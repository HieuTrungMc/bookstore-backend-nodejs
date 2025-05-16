export interface OrderItem {
    id: number;
    order_id: number;
    book_id: number;
    quantity: number;
    price: string;
    created_at: Date;
}

export interface OrderType {
    id: number;
    user_id: number;
    total: string;
    address: string;
    payment_method: string;
    created_at: Date;
    updated_at: Date;
    status?: string;
    order_items?: OrderItem[];
}
