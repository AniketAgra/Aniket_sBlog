import User from '../models/user.model.js'
import bcryptjs from "bcryptjs";
import { errorHandler } from '../utils/error.js';

export const signup = async(req,res,next) => {
    const {username, email, password} = req.body;

    if(!username || !email || !password || username === '' || email === '' || password === ''){
        next(errorHandler(400,'All Fields are mandatory.'))
    }

    const hashedPassword = bcryptjs.hashSync(password,10);

    try {
        const newUser = await User.create({username, email, password: hashedPassword});
        res.status(200).json({user: newUser._id});
    } catch (error) {
        next(error);
    }
}