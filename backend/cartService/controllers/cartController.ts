import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
export const addCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, bookId, quantity } = req.body;
  try {
    if (!userId || !bookId || !quantity) {
      res
        .status(400)
        .json({ error: "Missing required fields: userId, bookId, quantity" });
      return;
    }
    const existingItem = await prisma.cart_items.findFirst({
      where: { user_id: userId, book_id: bookId },
    });
    if (existingItem) {
      const updatedItem = await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      res.json({
        success: true,
        data: updatedItem,
      });
      return;
    }

    const newCartItem = await prisma.cart_items.create({
      data: {
        user_id: userId,
        book_id: bookId,
        quantity,
      },
    });
    res.status(200).json({
      success: true,
      data: newCartItem,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error when add to cart" });
  }
};

export const updateCartItemQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const cartItemId = parseInt(req.params.id);
  const { finalQuantity } = req.body;
  try {
    if (finalQuantity <= 0) {
      await prisma.cart_items.delete({ where: { id: cartItemId } });
      res.status(200).json({ success: true, message: "Cart item removed" });
      return;
    }

    const updatedItem = await prisma.cart_items.update({
      where: { id: cartItemId },
      data: { quantity: finalQuantity, updated_at: new Date() },
    });
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error when update cart item quantity",
    });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cartItemId } = req.body;

  try {
    const cart = await prisma.cart_items.delete({ where: { id: cartItemId } });
    res.status(200).json({ success: true, message: "Cart is deleted." });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res
      .status(500)
      .json({ success: false, message: "Error when delete cart items" });
  }
};
