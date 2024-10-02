import User from '../models/user.model.js'
import bcryptjs from "bcryptjs";
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

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

export const signin = async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password || email === '' || password === ''){
        next(errorHandler(400, 'All Fields are required'));
    }

    try {
        const validUser = await User.findOne({email});

        if(!validUser){
            return next(errorHandler(404, "Invalid Username or Password"));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);

        if(!validPassword){
            return next(errorHandler(400, 'Invalid Username or Password'));
        }

        const {password: pass, ...rest} = validUser._doc;

        const token = jwt.sign(
            {userId: validUser._id},
            process.env.JWT_SECRET,
    
        )
        res.status(200).cookie('access_token',token,{
            httpOnly: true}).json(rest);
        

    } catch (error) {
        next(error)
    }
}