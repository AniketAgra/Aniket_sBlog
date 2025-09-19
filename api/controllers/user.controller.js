import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
    res.status(200).json({ message: "User route is working" });
};
export const updateUser = async (req, res, next) => {
    if (req.user._id.toString() !== req.params.userId.toString()) {
        return next(errorHandler(403, 'You are not authorized to perform this action'));
    }

    try {
        // Load current user to check existing password state
        const existingUser = await User.findById(req.params.userId);
        if (!existingUser) {
            return next(errorHandler(404, 'User not found'));
        }

    // Handle password update rules (optional)
    const providedPasswordRaw = Object.prototype.hasOwnProperty.call(req.body, 'password') ? req.body.password : undefined;
    // Treat empty string or all-whitespace as no password change
    const wantsToChangePassword = typeof providedPasswordRaw === 'string' ? providedPasswordRaw.trim().length > 0 : Boolean(providedPasswordRaw);
        const providedCurrentPassword = req.body.currentPassword;

        if (wantsToChangePassword) {
            // First-time password creation allowed when no password exists (falsy)
            const hasExistingPassword = Boolean(existingUser.password);

            if (hasExistingPassword) {
                if (!providedCurrentPassword) {
                    return next(errorHandler(400, 'Current password is required to set a new password'));
                }
                const isCurrentValid = await bcryptjs.compare(providedCurrentPassword, existingUser.password);
                if (!isCurrentValid) {
                    return next(errorHandler(400, 'Current password is incorrect'));
                }
            }

            if (req.body.password.length < 6) {
                return next(errorHandler(400, 'Password must be at least 6 characters'));
            }
            req.body.password = await bcryptjs.hash(req.body.password, 10);
            // Do not persist currentPassword
            delete req.body.currentPassword;
        } else {
            // Not changing password: ensure we don't accidentally clear it
            delete req.body.password;
            delete req.body.currentPassword;
        }

        if (req.body.username) {
            if (req.body.username.length < 7 || req.body.username.length > 20) {
                return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
            }
            if (req.body.username.includes(' ')) {
                return next(errorHandler(400, 'Username cannot contain spaces'));
            }
            if (req.body.username !== req.body.username.toLowerCase()) {
                return next(errorHandler(400, 'Username must be lowercase'));
            }
            if (!/^[a-zA-Z0-9]+$/.test(req.body.username)) {
                return next(errorHandler(400, 'Username must contain only letters and numbers'));
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return next(errorHandler(404, 'User not found'));
        }

    const { password, __v, ...rest } = updatedUser._doc ?? {};
    res.status(200).json(rest);
    } catch (error) {
        // Handle duplicate key errors gracefully (e.g., username/email already in use)
        if (error && (error.code === 11000 || error.name === 'MongoServerError')) {
            const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : (error.keyValue ? Object.keys(error.keyValue)[0] : 'field');
            const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`;
            return next(errorHandler(409, message));
        }
        return next(errorHandler(500, 'Error updating user'));
    }
};

export const deleteUser = async (req, res, next) => {
    if (req.user._id.toString() !== req.params.userId.toString()) {
        return next(errorHandler(403, 'You are not authorized to perform this action'));
    }

    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        if (!deletedUser) {
            return next(errorHandler(404, 'User not found'));
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        next(errorHandler(500, 'Error deleting user'));
    }
};
