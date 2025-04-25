import express from "express";
import {
    createNewBook,
    createNewCategory,
    deleteBookById,
    deleteCategoryById,
    fetchAllBooks, fetchAllCategories, fetchBookDetails, fetchBooksByCategory, fetchNewArrivals, fetchRecommendations,
    updateBookById,
    updateCategoryById
} from "../controllers/bookController";

const router = express.Router();

router.get('/all', fetchAllBooks);
router.get('/allcategory', fetchAllCategories)
router.post('/createbook',createNewBook)
router.post('/createcategory', createNewCategory)
router.post('/deletebook/:bookId', deleteBookById)
router.post('/updatebook/:bookId', updateBookById)
router.post('/updatecategory/:categoryId', updateCategoryById)
router.post('/deletecategory/:categoryId',deleteCategoryById)
router.get('/category/:categorySlug', fetchBooksByCategory);
router.get('/new-arrivals/:categorySlug', fetchNewArrivals);
router.get('/recommendations/:categorySlug', fetchRecommendations);
router.get('/details/:bookId', fetchBookDetails);

export default router;
