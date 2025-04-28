const OrderItemType = {
    id: Number,
    user_id: Number,
    total: String,
    address: String,
    payment_method: String,
    created_at: Date,
    updated_at: Date,
}

export type OrderItemType = typeof OrderItemType