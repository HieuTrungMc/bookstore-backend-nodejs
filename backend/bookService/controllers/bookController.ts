import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchAllBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const books = await prisma.books.findMany({
            include: {
                categories: true,
                publishers: true,
                discounts: true,
                book_images: true,
            },
        });

        res.status(200).json({
            success: true,
            data: books,
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching books.",
        });
    }
};

export const fetchBooksByCategory = async (req: Request, res: Response): Promise<void> => {
    const { categorySlug } = req.params;

    try {
        const books = await prisma.books.findMany({
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
        });

        res.status(200).json({ success: true, data: books });
    } catch (error) {
        console.error("Error fetching books by category:", error);
        res.status(500).json({ success: false, message: "Failed to fetch books." });
    }
};

export const fetchNewArrivals = async (req: Request, res: Response): Promise<void> => {
    const { categorySlug } = req.params;

    try {
        const books = await prisma.books.findMany({
            where: {
                categories: {
                    slug: categorySlug,
                },
            },
            orderBy: {
                stock: "desc", // Sort by stock in descending order
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
        res.status(500).json({ success: false, message: "Failed to fetch new arrivals." });
    }
};

export const fetchRecommendations = async (req: Request, res: Response): Promise<void> => {
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
        res.status(500).json({ success: false, message: "Failed to fetch recommendations." });
    }
};

export const fetchBookDetails = async (req: Request, res: Response): Promise<void> => {
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
        res.status(500).json({ success: false, message: "Failed to fetch book details." });
    }
}
