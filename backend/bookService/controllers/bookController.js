"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryById = exports.updateCategoryById = exports.createNewCategory = exports.fetchAllCategories = exports.searchBooks = exports.deleteBookById = exports.updateBookById = exports.createNewBook = exports.fetchBookDetails = exports.fetchRecommendations = exports.fetchNewArrivals = exports.fetchBooksByCategory = exports.fetchAllBooks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const fetchAllBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sortBy = "", sortOrder = "asc", page = 1, limit = 25 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const sortOrderStr = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";
        const findOptions = {
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
            };
        }
        const books = yield prisma.books.findMany(findOptions);
        const total = yield prisma.books.count();
        res.status(200).json({
            success: true,
            data: books,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / take),
        });
    }
    catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching books.",
        });
    }
});
exports.fetchAllBooks = fetchAllBooks;
const fetchBooksByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categorySlug } = req.params;
    try {
        const { sortBy = "", sortOrder = "asc", page = 1, limit = 25 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const sortOrderStr = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";
        const findOptions = {
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
            };
        }
        const books = yield prisma.books.findMany(findOptions);
        const total = yield prisma.books.count();
        res.status(200).json({
            success: true,
            data: books,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / take),
        });
    }
    catch (error) {
        console.error("Error fetching books by category:", error);
        res.status(500).json({ success: false, message: "Failed to fetch books." });
    }
});
exports.fetchBooksByCategory = fetchBooksByCategory;
const fetchNewArrivals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categorySlug } = req.params;
    try {
        const books = yield prisma.books.findMany({
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
    }
    catch (error) {
        console.error("Error fetching new arrivals:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch new arrivals." });
    }
});
exports.fetchNewArrivals = fetchNewArrivals;
const fetchRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categorySlug } = req.params;
    try {
        const books = yield prisma.books.findMany({
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
    }
    catch (error) {
        console.error("Error fetching recommendations:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch recommendations." });
    }
});
exports.fetchRecommendations = fetchRecommendations;
const fetchBookDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    try {
        const book = yield prisma.books.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching book details:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch book details." });
    }
});
exports.fetchBookDetails = fetchBookDetails;
const createNewBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const book = yield prisma.books.create({
            data: Object.assign({}, data),
        });
        res.status(201).json({ success: true, data: book });
    }
    catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ success: false, message: "Failed to create book." });
    }
});
exports.createNewBook = createNewBook;
const updateBookById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    const data = req.body;
    try {
        const book = yield prisma.books.update({
            where: { id: Number(bookId) },
            data: Object.assign({}, data),
        });
        res.status(200).json({ success: true, data: book });
    }
    catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ success: false, message: "Failed to update book." });
    }
});
exports.updateBookById = updateBookById;
const deleteBookById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    try {
        const book = yield prisma.books.delete({
            where: { id: Number(bookId) },
        });
        res.status(200).json({ success: true, data: book });
    }
    catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ success: false, message: "Failed to delete book." });
    }
});
exports.deleteBookById = deleteBookById;
const searchBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, category, publisher, minPrice, maxPrice, author, sort = "id", order = "asc", page = 1, limit = 10, featured, isNew } = req.query;
        // Build the where clause based on search parameters
        const whereClause = {};
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
        const findOptions = {
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
            };
        }
        // Execute the query
        const books = yield prisma.books.findMany(findOptions);
        // Get total count for pagination
        const total = yield prisma.books.count({
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
    }
    catch (error) {
        console.error("Error searching books:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while searching for books.",
        });
    }
});
exports.searchBooks = searchBooks;
const fetchAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sortBy = "", sortOrder = "asc", page = 1, limit = 25 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const sortOrderStr = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";
        const findOptions = {
            skip,
            take,
        };
        if (sortBy) {
            findOptions.orderBy = {
                [String(sortBy)]: sortOrderStr,
            };
        }
        const categories = yield prisma.categories.findMany(findOptions);
        const total = yield prisma.categories.count();
        res.status(200).json({
            success: true,
            data: categories,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / take),
        });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch categories." });
    }
});
exports.fetchAllCategories = fetchAllCategories;
const createNewCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const category = yield prisma.categories.create({
            data: Object.assign({}, data),
        });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        console.error("Error creating category:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to create category." });
    }
});
exports.createNewCategory = createNewCategory;
const updateCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    const data = req.body;
    try {
        const category = yield prisma.categories.update({
            where: { id: Number(categoryId) },
            data: Object.assign({}, data),
        });
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        console.error("Error updating category:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to update category." });
    }
});
exports.updateCategoryById = updateCategoryById;
const deleteCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    try {
        const numberOfBooksInCategory = yield prisma.books.count({
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
        const category = yield prisma.categories.delete({
            where: { id: Number(categoryId) },
        });
        res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to delete category." });
    }
});
exports.deleteCategoryById = deleteCategoryById;
