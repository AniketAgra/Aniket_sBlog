import User from '../models/user.model.js';
import bcryptjs from "bcryptjs";
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

export const signup = async (req, res, next) => {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password) {
        return next(errorHandler(400, 'All Fields are mandatory.'));
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    try {
        const newUser = await User.create({ username, name: name || username, email, password: hashedPassword, passwordHash: hashedPassword, role: 'user' });
        res.status(200).json({ user: newUser._id });
    } catch (error) {
        // Handle duplicate key errors gracefully
        if (error && (error.code === 11000 || /duplicate key/i.test(error?.message))) {
            const field = Object.keys(error.keyPattern || {})[0];
            const isEmail = /email/i.test(field || '') || /email/i.test(error?.message || '');
            const isUsername = /username/i.test(field || '') || /username/i.test(error?.message || '');
            const message = isEmail
                ? 'Email already in use'
                : isUsername
                    ? 'Username already in use'
                    : 'Account already exists with provided details';
            return next(errorHandler(409, message));
        }
        next(error);
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(errorHandler(400, 'All Fields are required.'));
    }

    try {
        const validUser = await User.findOne({ email });

        if (!validUser) {
            return next(errorHandler(404, "Invalid Username or Password"));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);

        if (!validPassword) {
            return next(errorHandler(400, 'Invalid Username or Password'));
        }

        const { password: pass, ...rest } = validUser._doc;

        const token = jwt.sign(
            { id: validUser._id, role: validUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

                res
                    .status(200)
                    .cookie('access_token', token, {
                        httpOnly: true,
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                        secure: process.env.NODE_ENV === 'production',
                    })
                    .json(rest);

    } catch (error) {
        next(error);
    }
};

export const google = async (req, res, next) => {
    const { email, name, googlePhotoUrl } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            const { password, ...rest } = user._doc;

                        return res
                            .status(200)
                            .cookie('access_token', token, {
                                httpOnly: true,
                                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                                secure: process.env.NODE_ENV === 'production',
                            })
                            .json(rest);
        }

        let newUsername;
        let isUsernameTaken = true;

        while (isUsernameTaken) {
            newUsername = name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4);
            const existingUser = await User.findOne({ username: newUsername });
            if (!existingUser) isUsernameTaken = false;
        }

        const generatedPassword =
            Math.random().toString(36).slice(-8) +
            Math.random().toString(36).slice(-8);
        const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

        const newUser = new User({
            username: newUsername,
            name: name || newUsername,
            email,
            password: hashedPassword,
            passwordHash: hashedPassword,
            profilePicture: googlePhotoUrl,
            role: 'user',
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password, ...rest } = newUser._doc;

                res
                    .status(200)
                    .cookie('access_token', token, {
                        httpOnly: true,
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                        secure: process.env.NODE_ENV === 'production',
                    })
                    .json(rest);

    } catch (error) {
        next(error);
    }
};

export const signout = async (req, res, next) => {
        try {
                res
                    .clearCookie('access_token', {
                        httpOnly: true,
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                        secure: process.env.NODE_ENV === 'production',
                        path: '/',
                    })
                    .status(200)
                    .json({ message: 'Signed out successfully' });
        } catch (error) {
                next(error);
        }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return next(errorHandler(400, 'Email is required'));
        const user = await User.findOne({ email });
        if (!user) return next(errorHandler(404, 'User not found'));

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
        user.passwordResetToken = hashed;
        user.passwordResetExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
        await user.save();

        const baseUrl = process.env.CLIENT_URL || req.headers.origin || '';
        const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
        const html = `<p>You requested a password reset.</p><p>Click the link below to reset your password. This link is valid for 30 minutes.</p><p><a href="${resetUrl}" target="_blank">Reset Password</a></p><p>If you did not request this, you can ignore this email.</p>`;
        await sendEmail({ to: email, subject: 'Password Reset', html });
        res.json({ message: 'Password reset email sent' });
    } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, email, password } = req.body;
        if (!token || !email || !password) return next(errorHandler(400, 'All fields required'));
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ email, passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
        if (!user) return next(errorHandler(400, 'Token invalid or expired'));
        const hashedPassword = bcryptjs.hashSync(password, 10);
        user.password = hashedPassword;
        user.passwordHash = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (err) { next(err); }
};
