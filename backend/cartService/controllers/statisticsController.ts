import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get order statistics
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    // Get current date
    const now = new Date();
    
    // Calculate first day of current month and previous month
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Count orders from previous month
    const previousMonthOrders = await prisma.orders.count({
      where: {
        created_at: {
          gte: firstDayPreviousMonth,
          lt: firstDayCurrentMonth
        }
      }
    });
    
    // Count orders from current month
    const currentMonthOrders = await prisma.orders.count({
      where: {
        created_at: {
          gte: firstDayCurrentMonth,
          lt: firstDayNextMonth
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        previousMonthOrders,
        currentMonthOrders
      }
    });
  } catch (error) {
    console.error('Error getting order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
};

// Get sales statistics
export const getSalesStats = async (req: Request, res: Response) => {
  try {
    // Get current date
    const now = new Date();
    
    // Calculate first day of current month and previous month
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Calculate total sales from previous month
    const previousMonthSales = await prisma.orders.aggregate({
      where: {
        created_at: {
          gte: firstDayPreviousMonth,
          lt: firstDayCurrentMonth
        }
      },
      _sum: {
        total: true
      }
    });
    
    // Calculate total sales from current month
    const currentMonthSales = await prisma.orders.aggregate({
      where: {
        created_at: {
          gte: firstDayCurrentMonth,
          lt: firstDayNextMonth
        }
      },
      _sum: {
        total: true
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        previousMonthSales: previousMonthSales._sum.total || 0,
        currentMonthSales: currentMonthSales._sum.total || 0
      }
    });
  } catch (error) {
    console.error('Error getting sales statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales statistics'
    });
  }
};

// Get monthly sales for a specific year
export const getMonthlySalesStats = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    // Initialize result array with 12 months
    const monthlySales = Array(12).fill(0);
    
    // Get all orders for the specified year
    const orders = await prisma.orders.findMany({
      where: {
        created_at: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      },
      select: {
        total: true,
        created_at: true
      }
    });
    
    // Aggregate sales by month
    orders.forEach(order => {
      const month = order.created_at.getMonth();
      monthlySales[month] += Number(order.total);
    });
    
    res.status(200).json({
      success: true,
      data: {
        year,
        monthlySales
      }
    });
  } catch (error) {
    console.error('Error getting monthly sales statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly sales statistics'
    });
  }
};

// Get monthly order counts for a specific year
export const getMonthlyOrderStats = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    // Initialize result array with 12 months
    const monthlyOrders = Array(12).fill(0);
    
    // Get all orders for the specified year
    const orders = await prisma.orders.findMany({
      where: {
        created_at: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      },
      select: {
        created_at: true
      }
    });
    
    // Count orders by month
    orders.forEach(order => {
      const month = order.created_at.getMonth();
      monthlyOrders[month]++;
    });
    
    res.status(200).json({
      success: true,
      data: {
        year,
        monthlyOrders
      }
    });
  } catch (error) {
    console.error('Error getting monthly order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly order statistics'
    });
  }
};