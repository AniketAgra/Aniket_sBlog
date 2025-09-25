import mongoose from "mongoose";

// User schema now supports both the new contract and legacy fields for compatibility.
// New contract fields: name, email, passwordHash, role ('user' | 'admin')
// Legacy fields kept: username, password, profilePicture
const userSchema = new mongoose.Schema(
    {
        // New field (maps to legacy username)
        name: {
            type: String,
            required: false,
            trim: true,
        },
        // Legacy username kept for existing code; ensure uniqueness across either name/username usage
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        // New hashed password field
        passwordHash: {
            type: String,
        },
        // Legacy password field (hashed). We'll mirror writes for compatibility
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            required: true,
        },
        profilePicture: {
            type: String,
            default:
                'https://imgs.search.brave.com/n24eamZZyFy2YdTSYarsWPVTDFMgxdJj-gUWTIGoYqg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzg5LzkzLzI3/LzM2MF9GXzU4OTkz/Mjc4Ml92UUFFQVpo/SG5xMVFDR3U1aWt3/cllhUUQwTW11cm0w/Ti5qcGc',
        },
        passwordResetToken: {
            type: String,
            index: true,
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
    },
    { timestamps: true }
);

// Keep name and username in sync when possible
userSchema.pre("save", function (next) {
    if (!this.name && this.username) this.name = this.username;
    if (!this.username && this.name) this.username = this.name;
    // Mirror password into passwordHash if provided
    if (this.isModified("password") && this.password) {
        this.passwordHash = this.password;
    }
    next();
});

const User = mongoose.model("User", userSchema);
export default User;