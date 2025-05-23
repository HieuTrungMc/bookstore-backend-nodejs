import express from "express";
import cors from "cors";
import userRoutes from './routes/userRoutes';
// Add this line with the other imports
import statisticsRoutes from './routes/statisticsRoutes';

const PORT = process.env.PORT || 5003;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);
// Add this line where you define your routes
app.use('/statistics', statisticsRoutes);

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});