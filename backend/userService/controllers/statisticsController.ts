import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getUserStats = async (req: Request, res: Response) => {
  try {
    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count total users excluding admins
    const totalUsers = await prisma.users.count({
      where: {
        role: {
          not: 'admin'
        }
      }
    });
    
    // Count new users this month excluding admins
    const newUsersThisMonth = await prisma.users.count({
      where: {
        role: {
          not: 'admin'
        },
        // Assuming there's a created_at field. If not, you might need to add it to the schema
        // For now, we'll use the id as a proxy (higher id = newer user)
        AND: [
          {
            id: {
              gte: (await prisma.users.findFirst({
                where: {
                  role: { not: 'admin' }
                },
                orderBy: { id: 'asc' },
                select: { id: true }
              }))?.id || 0
            }
          }
        ]
      }
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth
      }
    });
  } catch (error) {
    console.error('Error getting user statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
};