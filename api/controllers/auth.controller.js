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

// Request password reset (always respond 200 for security)
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body || {};
    if (!email) return res.status(200).json({ message: 'If that account exists, a reset email has been sent.' });
    try {
        const user = await User.findOne({ email });
        if (user) {
            const tokenRaw = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
            user.passwordResetToken = tokenHash;
            user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
            await user.save();

            const baseUrl = process.env.FRONTEND_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173';
            const resetLink = `${baseUrl}/reset-password?token=${tokenRaw}&email=${encodeURIComponent(email)}`;
            const html = `
                <p>You requested a password reset for your account.</p>
                <p><a href="${resetLink}" target="_blank" rel="noopener">Click here to reset your password</a></p>
                <p>This link will expire in 1 hour. If you did not request this, you can ignore this email.</p>
            `;
            try {
                await sendEmail({ to: email, subject: 'Password Reset', html });
            } catch (e) {
                console.error('Failed to send reset email', e.message);
            }
        }
        return res.status(200).json({ message: 'If that account exists, a reset email has been sent.' });
    } catch (err) {
        next(err);
    }
};

// Reset password using token
export const resetPassword = async (req, res, next) => {
    const { email, token, password } = req.body || {};
    if (!email || !token || !password) return next(errorHandler(400, 'Missing required fields'));
    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ email, passwordResetToken: tokenHash, passwordResetExpires: { $gt: new Date() } });
        if (!user) return next(errorHandler(400, 'Invalid or expired reset token'));
        const hashedPassword = bcryptjs.hashSync(password, 10);
        user.password = hashedPassword;
        user.passwordHash = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return res.status(200).json({ message: 'Password reset successful. You can now sign in.' });
    } catch (err) {
        next(err);
    }
};
