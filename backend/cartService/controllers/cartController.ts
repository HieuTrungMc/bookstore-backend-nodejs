import { Request, Response } from "express";
import axios from "axios";
import prisma from "../utils/prismaClient";
import { Prisma, orders_status } from "@prisma/client";
import { CartItemType } from "../models/CartType";
import { OrderItemType } from "../models/OrderType";

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
      `${process.env.BOOKSERVICE_API_URL}/book/details/${bookId}`
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
        data: { ...updatedItem, book: bookReviews },
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
  const { bookId, finalQuantity } = req.body;
  try {
    if (finalQuantity <= 0) {
      await prisma.cart_items.delete({ where: { id: cartItemId } });
      res.status(200).json({ success: true, message: "Cart item removed" });
      return;
    }
    const bookRes = await axios.get(
      `${process.env.BOOKSERVICE_API_URL}/book/details/${bookId}`
    );
    const bookData = bookRes.data;

    const bookReviews = {
      title: bookData.data.title,
      price: bookData.data.price,
      image: bookData.data.book_images[0].url,
    };
    const updatedItem = await prisma.cart_items.update({
      where: { id: cartItemId },
      data: { quantity: finalQuantity, updated_at: new Date() },
    });
    res.status(200).json({ success: true, data: {
      ...updatedItem,
      book: bookReviews,
    } });
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
  const { cartItemId } = req.params;

  try {
    const cart = await prisma.cart_items.delete({
      where: { id: Number(cartItemId) },
    });
    res.status(200).json({ success: true, message: "Cart is deleted." });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res
      .status(500)
      .json({ success: false, message: "Error when delete cart items" });
  }
};

export const getAllCartItemsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.params.userId);

  if (!userId) {
    res.status(400).json({ success: false, message: "Missing or invalid userId" });
    return;
  }

  try {
    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: userId },
    });

    if (cartItems.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const cartItemsWithBookData = await Promise.all(
      cartItems.map(async (item:CartItemType) => {
        try {
          const bookRes = await axios.get(`${process.env.BOOKSERVICE_API_URL}/book/details/${item.book_id}`);
          const bookData = bookRes.data.data;

          const bookInfo = {
            title: bookData.title,
            price: bookData.price,
            image: bookData.book_images?.[0]?.url || "",
          };

          return {
            ...item,
            book: bookInfo,
          };
        } catch (err) {
          console.error(`Failed to fetch book ${item.book_id}`, err);
          return {
            ...item,
            book: null,
          };
        }
      })
    );
    res.status(200).json({
      success: true,
      data: cartItemsWithBookData,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({
      success: false,
      message: "Error when retrieving cart items",
    });
  }
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const { userId, address, paymentMethod  } = req.body;
  try {
    if (!userId) {
      res.status(400).json({ error: "Missing required field: userId" });
      return;
    }

    const order = await prisma.orders.create({
      data: {
        user_id: userId,
        total: 0,
        address: address,
        payment_method: paymentMethod,
      },
    });

    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: userId },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }
    let total = 0;

    await Promise.all(
      cartItems.map(async (item: CartItemType) => {
        const bookRes = await axios.get(
          `${process.env.BOOKSERVICE_API_URL}/book/details/${item.book_id}`
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
        address,
        payment_method: paymentMethod,
        total,
        message: "Order placed successfully!",
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ success: false, message: "Error when create new order" });
  }
};

export const updateOrderInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const orderId = parseInt(req.params.id);
  const { address, paymentMethod } = req.body;
  try {
    if (!address || !paymentMethod) {
      res
        .status(400)
        .json({ error: "Missing required fields: address, paymentMethod" });
      return;
    }
    const order = await prisma.orders.update({
      where: { id: orderId },
      data: {
        address: address,
        payment_method: paymentMethod,
        updated_at: new Date(),
      },
    });

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
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ success: false, message: "Error when update order info" });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    res
      .status(500)
      .json({ success: false, message: "Error when update order status" });
  }
};

export const getOrderInfoById = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const userResponse = await axios.get(
      `${process.env.BOOKSERVICE_API_URL}/user/user/${orders.user_id}`
    );
    const user = userResponse.data.user;
    const matchingAddress = user.addresses.find(
      (userAddress: any) => userAddress.address === orders.address
    );

    const userPhone = matchingAddress ? matchingAddress.receiver_phone : null;
    res.status(200).json({
      success: true,
      data: {
        ...orders,
        username: userResponse.data.user.username,
        user_phone: userPhone,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error when get orders" });
  }
};

export const getAllOrderInfoByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.body;
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
};

export const getAllOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      sortBy = "",
      sortOrder = "asc",
      page = 1,
      limit = 25,
      search = "",
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const sortOrderStr =
      String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";
    const findOptions: Prisma.ordersFindManyArgs = {
      skip,
      take,
      where: {},
    };
    if (search) {
      findOptions.where = {
        status: search as orders_status,
      };
    }
    if (sortBy) {
      findOptions.orderBy = {
        [String(sortBy)]: sortOrderStr,
      } as Prisma.ordersOrderByWithRelationInput;
    }
    const orders = await prisma.orders.findMany(findOptions);

    const ordersWithUser = await Promise.all(
      orders.map(async (order: OrderItemType) => {
        try {
          const userResponse = await axios.get(
            `${process.env.BOOKSERVICE_API_URL}/user/user/${order.user_id}`
          );
          const user = userResponse.data.user;

          const matchingAddress = user.addresses.find(
            (userAddress: any) => userAddress.address === order.address
          );

          const userPhone = matchingAddress
            ? matchingAddress.receiver_phone
            : null;
          return {
            ...order,
            username: userResponse.data.user.username,
            user_phone: userPhone,
          };
        } catch (err) {
          console.error(
            `Error fetching user data for userId ${order.user_id}:`,
            err
          );
          return {
            ...order,
            username: null,
            user_phone: null,
          };
        }
      })
    );
    const total = await prisma.orders.count({
      where: findOptions.where,
    });
    res.status(200).json({
      success: true,
      data: ordersWithUser,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when get all orders" });
  }
};
