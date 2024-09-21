import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from '../api/routes/user.route.js'
import authRoutes from '../api/routes/auth.route.js'

dotenv.config();

mongoose.connect(process.env.mongo_url)
.then(()=> {
    console.log("Connected To Mongo Successfully");
}).catch(err => {
    console.log(err);
});

const app = express();

app.use(express.json());

app.listen(7000,() =>{
    console.log('Server Is Running on Port 7000');
})

app.use('/api/user',userRoutes);
app.use('/api/auth',authRoutes);


app.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success:false,
        statusCode,
        message
    })
});