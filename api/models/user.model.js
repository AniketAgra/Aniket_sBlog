import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
    },
    password:{
        type: String,
        required:true,
    },
    profilePicture:{
        type: String,
        default:'https://imgs.search.brave.com/n24eamZZyFy2YdTSYarsWPVTDFMgxdJj-gUWTIGoYqg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1Lzg5LzkzLzI3/LzM2MF9GXzU4OTkz/Mjc4Ml92UUFFQVpo/SG5xMVFDR3U1aWt3/cllhUUQwTW11cm0w/Ti5qcGc',
    },
  },{timestamps:true}
);

const User = mongoose.model('User',userSchema);
export default User;