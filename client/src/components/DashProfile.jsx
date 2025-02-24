import { Alert, Button, TextInput } from "flowbite-react";
import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { updateStart,updateSuccess,updateFail } from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { set } from "mongoose";


export default function DashProfile() {
    const { currentUser } = useSelector((state) => state.user);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileURL, setImageFileURL] = useState(currentUser?.profilePicture || "");
    const filePickerRef = useRef(); // Reference to the file input element
    const placeholderImage = "https://via.placeholder.com/150"; // Placeholder image
    const [imageFileUploadError, setImageFileUploadError] = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [formData,setFormdata] = useState({});
    const dispatch = useDispatch();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                console.error("Invalid file type. Please upload an image.");
                return;
            }
            setImageFile(file);
            setImageFileURL(URL.createObjectURL(file)); // Create a local URL for the image
        }
    };

    useEffect(() => {
        if (imageFile) {
            uploadImage();
        }
    }, [imageFile]);

    const uploadImage = async () => {
        setImageFileUploading(true); // Set uploading status to true
        setImageFileUploadError(null);
        setImageFileUploadProgress(null); // Reset progress
    
        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
                formData.append("cloud_name", "dwtgjddna");
    
                const xhr = new XMLHttpRequest();
                xhr.open("POST", import.meta.env.VITE_CLOUDINARY_URL, true);
    
                // Handle progress updates
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const progress = Math.round((e.loaded / e.total) * 100);
                        setImageFileUploadProgress(progress);
                        console.log(`Uploading: ${progress}%`);
                    }
                };
    
                // Handle successful response
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const imgData = JSON.parse(xhr.responseText);
                        setImageFileURL(imgData.secure_url || imgData.url); // Use the uploaded image URL
                        setImageFileUploadProgress(100); // Ensure progress shows 100%
                        setFormdata({...formData,profilePicture:imgData.secure_url || imgData.url})
                        setImageFileUploading(false); // Set uploading status to false
                    } else {
                        throw new Error("Failed to upload image");
                    }
                };
    
                // Handle errors
                xhr.onerror = () => {
                    setImageFileUploadError("Failed to upload image. Please try again.");
                    setImageFileUploadProgress(null);
                    setImageFile(null);
                    setImageFileURL(null);
                    setImageFileUploading(false);
                };
    
                xhr.send(formData); // Send the form data
            }
        } catch (error) {
            setImageFileUploadError("An unexpected error occurred while uploading the image.");
            setImageFileUploadProgress(null);
            setImageFile(null);
            setImageFileURL(null);
            setImageFileUploading(false);
        }
    };
    

    const handleFormSubmit = async(e) => {
        e.preventDefault();
        setUpdateUserError(null);
        setUpdateUserSuccess(null);
        if(Object.keys(formData).length === 0){    //Object.keys() - returns an array of a given object's own enumerable property names
            setUpdateUserError("Please update at least one field.");
            return;
        }
        if(imageFileUploading){
            return;
        }
        try{
            dispatch(updateStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify(formData)
            })
            const data = await res.json();
            if(!res.ok){
                dispatch(updateFail(data.message))
                setUpdateUserError(data.message);
            }else{
                dispatch(updateSuccess(data));
                setUpdateUserSuccess("User profile updated successfully.");
            }
        }catch(error){
            dispatch(updateFail(error.message));
        }
    };

    const handleChange = (e) => {
        setFormdata({...formData,[e.target.id]:e.target.value})
    }

    console.log(formData)

    return (
        <div className="max-w-lg mx-auto p-3 w-full">
            <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={filePickerRef}
                    hidden
                />

                <div
                    className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
                    onClick={() => filePickerRef.current.click()}
                >
                    {imageFileUploadProgress && (
                        <CircularProgressbar value={imageFileUploadProgress || 0}
                         text={`${imageFileUploadProgress}%`} 
                         strokeWidth={5}
                         styles={{
                            root: { width: "100%", height: "100%" ,position: "absolute",top: 0,left: 0},
                            path: { stroke: `rgba(62,152,199), ${imageFileUploadProgress / 100}` },
                         }}
                         />
                    )}
                    <img
                        src={imageFileURL || placeholderImage}
                        alt="user"
                        className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${imageFileUploadProgress && imageFileUploadProgress < 100 && "opacity-60"}`}
                    />
                </div>
                {imageFileUploadError && <Alert color='failure'>{imageFileUploadError}</Alert>}
                <TextInput
                    type="text"
                    id="username"
                    placeholder="Username"
                    defaultValue={currentUser?.username}onChange = {handleChange}
                />
                <TextInput
                    type="email"
                    id="email"
                    placeholder="Email"
                    defaultValue={currentUser?.email}onChange = {handleChange}
                />
                <TextInput type="password" id="password" placeholder="Password" onChange = {handleChange}/>
                <Button
                    type="submit"
                    className="border-2 bg-none text-blue-500 border-x-purple-500 border-y-blue-500 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-purple-500 hover:to-blue-500 rounded-md"
                    pill
                >
                    Update
                </Button>
            </form>
            <div className="text-red-500 flex justify-between mt-5">
                <span className="cursor-pointer">Delete Account</span>
                <span className="cursor-pointer">Sign Out</span>
            </div>
            {updateUserSuccess && <Alert color='success'>{updateUserSuccess}</Alert>}
            {updateUserError && <Alert color='failure'>{updateUserError}</Alert>}
        </div>
    );
}
