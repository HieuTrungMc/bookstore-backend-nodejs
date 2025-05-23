import express from "express";
import cors from "cors"
import cartRoutes from './routes/cartRoutes'
import statisticsRoutes from './routes/statisticsRoutes';

const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(cors())

app.use('/cart', cartRoutes)
app.use('/statistics', statisticsRoutes);

app.listen(PORT, ()=> {
    console.log(`Server running at port ${PORT}`);
    
})
