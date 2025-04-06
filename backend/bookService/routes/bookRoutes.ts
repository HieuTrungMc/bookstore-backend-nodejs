import express from "express";
import {
    fetchAllBooks, fetchBookDetails, fetchBooksByCategory, fetchNewArrivals, fetchRecommendations
} from "../controllers/bookController";

const router = express.Router();

router.get('/all', fetchAllBooks);
router.get('/category/:categorySlug', fetchBooksByCategory);
router.get('/new-arrivals/:categorySlug', fetchNewArrivals);
router.get('/recommendations/:categorySlug', fetchRecommendations);
router.get('/details/:bookId', fetchBookDetails);

export default router;
