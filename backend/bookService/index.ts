import express from "express";
import cors from "cors"
import bookRoutes from './routes/bookRoutes'

const PORT = process.env.PORT || 5001
const app = express()

app.use(express.json())
app.use(cors())

app.use('/book', bookRoutes)

app.listen(PORT, ()=> {
    console.log(`Server running at port ${PORT}`);

})