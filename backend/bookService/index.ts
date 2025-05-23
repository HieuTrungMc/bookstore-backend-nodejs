import express from "express";
import cors from "cors"
import bookRoutes from './routes/bookRoutes'
import statisticsRoutes from './routes/statisticsRoutes';

const PORT = process.env.PORT || 5001
const app = express()

app.use(express.json())
app.use(cors())

app.use('/book', bookRoutes)
app.use('/statistics', statisticsRoutes);

app.listen(PORT, ()=> {
    console.log(`Server running at port ${PORT}`);

})