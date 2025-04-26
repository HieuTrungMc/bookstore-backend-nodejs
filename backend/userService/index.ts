import express from "express";
import cors from "cors";
import userRoutes from './routes/userRoutes';

const PORT = process.env.PORT || 3003;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});