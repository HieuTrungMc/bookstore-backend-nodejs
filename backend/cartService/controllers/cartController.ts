import { Request, Response} from 'express'
import prisma from '../utils/prismaClient'
/* export const findCartByUserId = async (req:Request, res:Response):Promise<void> => {
    const { userId } = req.params;
    try {
        const userCart = await prisma.cart.findFirst({
            where: {
                user_id: userId,
                status: "PENDING"
            },
            include: {
                cart_details: true
            }
        })
        res.status(200).json(userCart)
    } catch (error) {
        res.status(500).json({error: "Error when find user cart"})
    }
} */
    async function findPendingCart(userId: number) {
        return await prisma.cart.findFirst({
            where: {
                user_id: userId,
                status: "PENDING"
            },
            include: {
                cart_details: true
            }
        });
      }
export const addToCart = async(req:Request, res:Response):Promise<void> => {
    const {userId, bookId, quantity} = req.body
    try {
        if (!userId || !bookId || !quantity) {
            res.status(400).json({ error: "Missing required fields: userId, bookId, quantity" });
            return;
        }
        const book = await prisma.books.findUnique({
            where:{
                id: bookId
            }
        })
        if(!book){
            res.status(404).json({error: "Not found book"})
            return;
        }

        let cart = await findPendingCart(userId)
        if(!cart){
            cart = await prisma.cart.create({
                data: {
                    id: 1,
                    user_id: userId,
                    status: "PENDING"
                },
                include: {
                    cart_details: true
                }
            })
        }
        const existingItem = await prisma.cart_details.findFirst({
            where: {
                cart_id: cart.id,
                book_id: bookId
            }
        });
        if (existingItem) {
            const updatedCartDetail = await prisma.cart_details.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                    price: (existingItem.quantity + quantity) * book.price
                }
            });
            res.status(200).json(updatedCartDetail);
        } else {
            const newCartDetail = await prisma.cart_details.create({
                data: {
                    id: 1,
                    cart_id: cart.id,
                    book_id: bookId,
                    price: book.price * quantity,
                    quantity: quantity,
                    status: 1,
                }
            });
            res.status(200).json(newCartDetail);
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Error when add to cart"})
    }
}

export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
    const { userId, bookId, quantity } = req.body;

    try {
        const cart = await findPendingCart(userId);
        if (!cart) {
            res.status(404).json({ error: "Cart not found" });
            return;
        }

        const cartItem = await prisma.cart_details.findFirst({
            where: {
                cart_id: cart.id,
                book_id: bookId
            }
        });

        if (!cartItem) {
            res.status(404).json({ error: "Item not found in cart" });
            return;
        }

        if (cartItem.quantity > 1) {
            const updatedCartDetail = await prisma.cart_details.update({
                where: { id: cartItem.id },
                data: {
                    quantity: cartItem.quantity - quantity,
                    price: (cartItem.quantity - quantity) * cartItem.price / cartItem.quantity
                }
            });
            res.status(200).json(updatedCartDetail);
        } else {
            await prisma.cart_details.delete({
                where: { id: cartItem.id }
            });
            const remainingItems = await prisma.cart_details.count({
                where: { cart_id: cart.id }
            });

            if (remainingItems === 0) {
                await prisma.cart.delete({
                    where: { id: cart.id }
                });
                res.status(200).json({ message: "Cart is empty, deleted." });
            } else {
                res.status(200).json({ message: "Item removed from cart." });
            }
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ error: "Error when removing from cart" });
    }
};
