import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export const fetchAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sortBy = "", sortOrder = "asc", page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const sortOrderStr =
      String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    const findOptions: Prisma.booksFindManyArgs = {
      include: {
        categories: true,
        publishers: true,
        discounts: true,
        book_images: true,
      },
      skip,
      take,
    };
    if (sortBy) {
      findOptions.orderBy = {
        [String(sortBy)]: sortOrderStr,
      } as Prisma.booksOrderByWithRelationInput;
    }
    const books = await prisma.books.findMany(findOptions);
    const total = await prisma.books.count();
    res.status(200).json({
      success: true,
      data: books,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching books.",
    });
  }
};

export const fetchBooksByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { categorySlug } = req.params;

  try {
    const { sortBy = "", sortOrder = "asc", page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const sortOrderStr =
      String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";
    const findOptions: Prisma.booksFindManyArgs = {
      where: {
        categories: {
          slug: categorySlug,
        },
      },
      include: {
        categories: true,
        publishers: true,
        discounts: true,
        book_images: true,
      },
      skip,
      take,
    };
    if (sortBy) {
      findOptions.orderBy = {
        [String(sortBy)]: sortOrderStr,
      } as Prisma.booksOrderByWithRelationInput;
    }
    const books = await prisma.books.findMany(findOptions);
    const total = await prisma.books.count();
    res.status(200).json({
      success: true,
      data: books,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching books by category:", error);
    res.status(500).json({ success: false, message: "Failed to fetch books." });
  }
};

export const fetchNewArrivals = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { categorySlug } = req.params;

  try {
    const books = await prisma.books.findMany({
      where: {
        categories: {
          slug: categorySlug,
        },
      },
      orderBy: {
        stock: "desc",
      },
      take: 10,
      include: {
        categories: true,
        book_images: true,
      },
    });

    res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res
    .status(500)
    .json({ success: false, message: "Failed to fetch new arrivals." });
  }
};

export const fetchRecommendations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { categorySlug } = req.params;

  try {
    const books = await prisma.books.findMany({
      where: {
        categories: {
          slug: categorySlug,
        },
      },
      orderBy: {
        id: "asc",
      },
      take: 4, // Limit 4
      include: {
        categories: true,
        book_images: true,
      },
    });

    res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res
    .status(500)
    .json({ success: false, message: "Failed to fetch recommendations." });
  }
};

export const fetchBookDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { bookId } = req.params;

  try {
    const book = await prisma.books.findUnique({
      where: {
        id: Number(bookId),
      },
      include: {
        categories: true,
        publishers: true,
        discounts: true,
        book_images: true,
      },
    });

    if (!book) {
      res.status(404).json({ success: false, message: "Book not found." });
      return;
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error("Error fetching book details:", error);
    res
    .status(500)
    .json({ success: false, message: "Failed to fetch book details." });
  }
};

export const createNewBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body;
  try {
    const book = await prisma.books.create({
      data: {
        ...data,
      },
    });
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ success: false, message: "Failed to create book." });
  }
};

export const updateBookById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { bookId } = req.params;
  const data = req.body;
  try {
    const book = await prisma.books.update({
      where: { id: Number(bookId) },
      data: {
        ...data,
      },
    });
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: "Failed to update book." });
  }
};

export const deleteBookById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { bookId } = req.params;
  try {
    const book = await prisma.books.delete({
      where: { id: Number(bookId) },
    });
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: "Failed to delete book." });
  }
};

export const searchBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      query,
      category,
      publisher,
      minPrice,
      maxPrice,
      author,
      sort = "id",
      order = "asc",
      page = 1,
      limit = 10,
      featured,
      isNew
    } = req.query;

    // Build the where clause based on search parameters
    const whereClause: Prisma.booksWhereInput = {};

    // Text search for title, description, and author
    if (query) {
      const searchQuery = String(query);
      whereClause.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } },
        { author: { contains: searchQuery } }
      ];
    }

    // Filter by author if provided
    if (author) {
      whereClause.author = { contains: String(author) };
    }

    // Filter by category if provided
    if (category) {
      whereClause.categories = {
        slug: String(category)
      };
    }

    // Filter by publisher if provided
    if (publisher) {
      whereClause.publishers = {
        slug: String(publisher)
      };
    }

    // Filter by price range if provided
    if (minPrice || maxPrice) {
      whereClause.price = {};

      if (minPrice) {
        whereClause.price.gte = parseFloat(String(minPrice));
      }

      if (maxPrice) {
        whereClause.price.lte = parseFloat(String(maxPrice));
      }
    }

    // Filter by featured status
    if (featured !== undefined) {
      whereClause.is_featured = featured === 'true' ? true : false;
    }

    // Filter by new status
    if (isNew !== undefined) {
      whereClause.is_new = isNew === 'true' ? true : false;
    }

    // Calculate pagination values
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    const sortOrder = String(order).toLowerCase() === "asc" ? "asc" : "desc";

    // Create the find options
    const findOptions: Prisma.booksFindManyArgs = {
      where: whereClause,
      include: {
        categories: true,
        publishers: true,
        discounts: true,
        book_images: true,
      },
      skip,
      take: limitNum,
    };

    // Add sorting
    const sortField = String(sort);
    if (sortField) {
      findOptions.orderBy = {
        [sortField]: sortOrder
      } as Prisma.booksOrderByWithRelationInput;
    }

    // Execute the query
    const books = await prisma.books.findMany(findOptions);

    // Get total count for pagination
    const total = await prisma.books.count({
      where: whereClause,
    });

    // Send response
    res.status(200).json({
      success: true,
      data: books,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({
        success: false,
      message: "An error occurred while searching for books.",
      });
    }
};

export const fetchAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sortBy = "", sortOrder = "asc", page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const sortOrderStr =
      String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    const findOptions: Prisma.categoriesFindManyArgs = {
      skip,
      take,
    };
    if (sortBy) {
      findOptions.orderBy = {
        [String(sortBy)]: sortOrderStr,
      } as Prisma.categoriesOrderByWithRelationInput;
    }
    const categories = await prisma.categories.findMany(findOptions);
    const total = await prisma.categories.count();
    res.status(200).json({
      success: true,
      data: categories,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
    .status(500)
    .json({ success: false, message: "Failed to fetch categories." });
  }
};

export const createNewCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body;
  try {
    const category = await prisma.categories.create({
      data: {
        ...data,
      },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    res
    .status(500)
    .json({ success: false, message: "Failed to create category." });
  }
};

export const updateCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { categoryId } = req.params;
  const data = req.body;
  try {
    const category = await prisma.categories.update({
      where: { id: Number(categoryId) },
      data: {
        ...data,
      },
    });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    res
    .status(500)
    .json({ success: false, message: "Failed to update category." });
  }
};

export const deleteCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { categoryId } = req.params;
  try {
    const numberOfBooksInCategory = await prisma.books.count({
      where: { category_id: Number(categoryId) },
    });
    if (numberOfBooksInCategory > 0) {
      res
      .status(400)
      .json({
        success: false,
        message: "Cannot delete category with existing books.",
      });
      return;
    }
    const category = await prisma.categories.delete({
      where: { id: Number(categoryId) },
    });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error("Error deleting category:", error);
    res
    .status(500)
    .json({ success: false, message: "Failed to delete category." });
  }
};
