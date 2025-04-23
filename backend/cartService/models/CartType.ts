const CartItemType = {
    id: Number,
    user_id: Number,
    book_id: Number,
    quantity: Number,
    created_at: Date,
    updated_at: Date,
}

export type CartItemType = typeof CartItemType