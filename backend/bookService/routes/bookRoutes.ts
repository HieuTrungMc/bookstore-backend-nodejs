import express from "express";
import {
    fetchAllBooks, fetchBooksByCategory, fetchNewArrivals, fetchRecommendations
} from "../controllers/bookController";

const router = express.Router();

router.post('/all', fetchAllBooks);
router.get('/category/:categorySlug', fetchBooksByCategory);
router.get('/new-arrivals/:categorySlug', fetchNewArrivals);
router.get('/recommendations/:categorySlug', fetchRecommendations);

export default router;
