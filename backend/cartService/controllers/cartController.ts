import { Request, Response } from "express";
import axios from "axios";
import prisma from "../utils/prismaClient";
import { CartItemType } from "../models/CartType";

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

    const bookRes = await axios.get(
      `http://localhost:5000/book/details/${bookId}`
    );
    const bookData = bookRes.data;

    const bookReviews = {
      title: bookData.data.title,
      price: bookData.data.price,
      image: bookData.data.book_images[0].url,
    };

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
        data: { ...updatedItem, book:bookReviews },
      });
      return;
    }

    if (!bookData) {
      res.status(404).json({ error: "Book not found in Book Service" });
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
      data: {
        ...newCartItem,
        book: bookReviews,
      },
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


export const checkout = async (req: Request, res: Response):Promise<void> => {
  const { userId } = req.body;
  try {

    if (!userId) {
      res.status(400).json({ error: "Missing required field: userId" });
      return;
    }

    const order = await prisma.orders.create({
      data:{
        user_id: userId,
        total: 0,
        address: "",
        payment_method: "",
      }
    })

    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: userId },
    });

    if (cartItems.length === 0) {
        res.status(400).json({ error: 'Cart is empty' });
      return 
    }
    let total = 0;

    await Promise.all(
      cartItems.map(async (item: CartItemType) => {
        const bookRes = await axios.get(
          `http://localhost:5000/book/details/${item.book_id}`
        );
        const bookData = bookRes.data;
        const itemTotal = bookData.data.price * Number(item.quantity);
        total += itemTotal;

        await prisma.order_items.create({
          data: {
            order_id: order.id,
            book_id: item.book_id,
            quantity: item.quantity,
            price: itemTotal,
          },
        });

        await prisma.cart_items.delete({
          where: { id: item.id },
        });
      })
    );
    
    await prisma.orders.update({
      where: { id: order.id },
      data: { total },
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        total,
        message: "Order placed successfully!",
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: "Error when create new order" });
  }
};


export const updateOrderInfo = async (req: Request, res: Response):Promise<void> => {
  const orderId = parseInt(req.params.id);
  const {address, paymentMethod} = req.body;
  try {
    if(!address || !paymentMethod) {
      res.status(400).json({ error: "Missing required fields: address, paymentMethod" });
      return;
    }
    const order = await prisma.orders.update({
      where: { id: orderId },
      data: {
        address: address,
        payment_method: paymentMethod,
        updated_at: new Date(),
      }
    })

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        address: order.address,
        paymentMethod: order.payment_method,
        message: "Order info updated successfully!",
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: "Error when update order info" });
  }
}

export const updateOrderStatus = async (req: Request, res: Response):Promise<void> => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  try {
    if (!status) {
      res.status(400).json({ error: "Missing required field: status" });
      return;
    }

    const order = await prisma.orders.update({
      where: { id: orderId },
      data: { status, updated_at: new Date() },
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        message: "Order status updated successfully!",
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error when update order status" });
  }
}

export const getOrderInfoById = async (req: Request, res: Response):Promise<void> => {
  const orderId = parseInt(req.params.id);
  try {
    if (!orderId) {
      res.status(400).json({ error: "Missing required field: orderId" });
      return;
    }

    const orders = await prisma.orders.findFirst({
      where: { id: orderId },
      include: {
        order_items: true,
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error when get orders" });
  }
}

export const getAllOrderInfoByUserId = async (req: Request, res: Response):Promise<void> => {
  const {userId} = req.body
  try {
    if (!userId) {
      res.status(400).json({ error: "Missing required field: userId" });
      return;
    }

    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: true,
      },
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error when get orders" });
  }
}
