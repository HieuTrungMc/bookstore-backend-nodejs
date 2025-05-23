import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get top 5 bestselling books for a specific time period
export const getTopSellingBooks = async (req: Request, res: Response) => {
  let startDate: Date;
  try {
    const { period } = req.params; // 'week', 'month', or 'year'

    // Calculate the start date based on the period
    const now = new Date();

    switch (period) {
      case 'week':
        // Start date is 7 days ago
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        // Start date is first day of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        // Start date is first day of current year
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Use "week", "month", or "year".'
        });
    }

    // We need to query the cartService database to get order items
    // Since we're in a microservice architecture, we'll need to make an HTTP request
    // to the cartService API or use a direct database connection if allowed

    // For now, let's assume we can directly access the order_items table
    // This would need to be replaced with an API call in a real microservice architecture

    // Get top 5 bestselling books based on order items
    const topBooks = await prisma.$queryRaw`
        SELECT b.id, b.title, b.author, SUM(oi.quantity) as total_sold
        FROM books b
                 JOIN satancra_cartService.order_items oi ON b.id = oi.book_id
                 JOIN satancra_cartService.orders o ON oi.order_id = o.id
        WHERE o.created_at >= ${startDate}
        GROUP BY b.id, b.title, b.author
        ORDER BY total_sold DESC
            LIMIT 5
    `;

    res.status(200).json({
      success: true,
      data: topBooks
    });
  } catch (error) {
    console.error('Error getting top selling books:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top selling books'
    });
  }
};