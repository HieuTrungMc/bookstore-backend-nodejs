import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils';
import { Prisma, posts_status } from '@prisma/client';

// Register a new user
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password, name, email } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if username already exists
    const existingUser = await prisma.users.findFirst({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.users.findFirst({
        where: { email }
      });

      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        name: name || null,
        email: email || null,
        status: 1 // Active status
      }
    });

    // Generate JWT token
    const token = generateToken(newUser.id);

    // Return user data (excluding password) and token
    const { password: _, ...userData } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find the user
    const user = await prisma.users.findFirst({
      where: { email: username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 1) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (excluding password) and token
    const { password: _, ...userData } = user;
    
    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get account info by email
export const getAccountInfo = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find the user by email
    const user = await prisma.users.findFirst({
      where: { email },
      include: {
        addresses: true // Include user addresses
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (excluding password)
    const { password, ...userData } = user;
    
    res.status(200).json({
      user: userData
    });
  } catch (error) {
    console.error('Get account info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find the user by ID
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        addresses: true // Include user addresses
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
  }

    // Return user data (excluding password)
    const { password, ...userData } = user;

    res.status(200).json({
      user: userData
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Find the user
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user profile (for authenticated users)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.userId;

    // Find the user
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        addresses: true // Include user addresses
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (excluding password)
    const { password, ...userData } = user;

    res.status(200).json({
      user: userData
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const createPost = async(req: Request, res: Response):Promise<void> => {
  const {title, category, content, userId} = req.body;
  try{
    const slug = title.toLowerCase().replace(/\s+/g, '-').substring(0, 50);
    const post = await prisma.posts.create({
      data: {
        title,
        slug,
        category,
        content,
        user_id: userId,
        created_at: new Date(),
      },
      include:{
        users: true,
      }
    });
    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch(error){
    console.error(error);
    res.status(500).json({ error: "Error when create posts" });
  }
}

export const deletePost = async(req: Request, res: Response):Promise<void> => {
  const { id } = req.params;
  try{
    const post = await prisma.posts.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch(error){
    console.error(error);
    res.status(500).json({ error: "Error when delete posts" });
  }
}

export const updatePost = async(req: Request, res: Response):Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  try{
    let updatedData = { ...data };
    if (data.title) {
      updatedData.slug = data.title.toLowerCase().replace(/\s+/g, '-').substring(0, 50);
    }
    updatedData.updated_at = new Date();
    const post = await prisma.posts.update({
      where: {
        id: Number(id),
      },
      data: updatedData,

    });
    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch(error){
    console.error(error);
    res.status(500).json({ error: "Error when update posts" });
  }
}

export const getAllPosts = async(req: Request, res: Response):Promise<void> => {
  const {
    sortBy = "",
    sortOrder = "asc",
    page = 1,
    limit = 25,
    search = "",
  } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const sortOrderStr =
      String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";
    const findOptions: Prisma.postsFindManyArgs = {
      skip,
      take,
      where: {},
      include:{
        users: true,
      }
    };
    const validStatuses: posts_status[] = ["published", "draft"];
    if (search) {
      const searchConditions: any[] = [
        {
          title: {
            contains: String(search),
          },
        },
        {
          category: {
            contains: String(search),
          },
        },
      ];
      if (validStatuses.includes(search as posts_status)) {
        searchConditions.push({
          status: search as posts_status,
        });
      }
      findOptions.where = {
        OR: searchConditions,
      };
    }
    if (sortBy) {
      findOptions.orderBy = {
        [String(sortBy)]: sortOrderStr,
      } as Prisma.postsOrderByWithRelationInput;
    }
    const posts = await prisma.posts.findMany(findOptions);
    const total = await prisma.posts.count({
      where: findOptions.where,
    });
    res.status(200).json({
      success: true,
      data: posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when fetch all posts" });
  }
}