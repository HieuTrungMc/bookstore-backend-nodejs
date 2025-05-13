import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils';
import { Prisma, posts_status } from '@prisma/client';
import { uploadFile } from '../utils/uploadUtils';


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

// Get all addresses by user id
export const getAllAdressByUserId = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params
  try {
    if (!userId) {
      res.status(200).json({ message: "User Id is required" })
      return;
    }
    const address = await prisma.addresses.findMany({
      where: { user_id: Number(userId) }
    })
    res.status(200).json({
      success: true,
      data: {
        address,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when get all address" });
  }
}

// Update user information
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, name, email, avatar } = req.body;

  try {
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        username,
        name,
        email,
        avatar
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Could not update user" });
  }
};

// Add a new address
export const addNewAddress = async (req: Request, res: Response): Promise<void> => {
  const { address, receiverName, receiverPhone, userId } = req.body
  try {
    if (!userId) {
      res.status(200).json({ message: "User Id is required" })
      return;
    }
    const newAddress = await prisma.addresses.create({
      data: {
        user_id: userId,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        address: address,
      }
    })
    res.status(200).json({
      success: true,
      data: {
        newAddress,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when create new address" });
  }
}

// Update Address
export const updateAddress = async (req: Request, res: Response) => {
  const { addressId } = req.params;
  const updateData = req.body;

  try {
    const updatedAddress = await prisma.addresses.update({
      where: {
        id: Number(addressId),
      },
      data: updateData,
    });

    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error('Error updating address: ', error);
    res.status(500).json({ message: 'Failed to update address' });
  }
};

// Delete Address
export const deleteAddress = async (req: Request, res: Response) => {
  const { addressId } = req.params;

  try {
    const deletedAddress = await prisma.addresses.delete({
      where: {
        id: Number(addressId),
      },
    });
    res.status(200).json(deletedAddress);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address: ', error });
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

// Upload Image
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = req.file;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!image) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload the file to S3 and get the URL
    const imageUrl = await uploadFile(image);

    // Save attachment information to the database
    const attachment = await prisma.attachments.create({
      data: {
        user_id: userId,
        file_name: image.originalname,
        file_url: imageUrl
      }
    });

    // Update user's avatar if needed
    await prisma.users.update({
      where: { id: userId },
      data: { avatar: imageUrl }
    });
    res.status(200).json({
      ok: 1,
      message: 'File uploaded successfully',
      attachment: {
        id: attachment.id,
        fileName: attachment.file_name,
        fileUrl: attachment.file_url,
        userId: attachment.user_id
      }
    });
  } catch (error: any) {
    console.error('Upload image error:', error);
    res.status(400).json({ ok: 0, message: `Error uploading image: ${error.message}` });
  }
};

// Create a new Post
export const createPost = async (req: Request, res: Response): Promise<void> => {
  const { title, category, content, userId } = req.body;
  try {
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
      include: {
        users: true,
      }
    });
    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when create posts" });
  }
}

// Delete a Post
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when delete posts" });
  }
}

// Update an Existing Post
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when update posts" });
  }
}

// Get All Posts
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
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
      include: {
        users: true,
      }
    };
    const validStatuses: posts_status[] = [ "published", "draft" ];
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
        [ String(sortBy) ]: sortOrderStr,
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

// Get All Attachments
export const getAllAttachments = async (req: Request, res: Response) => {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of attachments
    const totalCount = await prisma.attachments.count();

    // Get attachments with pagination and include user information
    const attachments = await prisma.attachments.findMany({
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc' // Most recent first
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: attachments,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all attachments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving attachments',
      error: (error as Error).message
    });
  }
};

// Get media by ID
export const getMediaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Media ID is required' });
    }

    const mediaId = parseInt(id, 10);

    if (isNaN(mediaId)) {
      return res.status(400).json({ message: 'Invalid media ID format' });
    }

    // Find the attachment by ID
    const media = await prisma.attachments.findUnique({
      where: { id: mediaId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving media',
      error: (error as Error).message
    });
  }
};

export const getPostDetails = async (req: Request, res: Response):Promise<void> => {
  const {
    id="",
    slug=""
  } = req.query;
  try {
    const findOptions: Prisma.postsFindManyArgs = {
      where: {
      },
      include: {
        users: true,
      }
    };

    if (id) {
      findOptions.where = {
        id: parseInt(id as string),
      };
    } else if (slug) {
      findOptions.where = {
        slug: slug as string,
      };
    }
    const posts = await prisma.posts.findFirst(findOptions);
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error when fetch post details" });
  }
}
