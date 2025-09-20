import { Alert, Button, TextInput, Modal } from "flowbite-react";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect, useCallback } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFail,
  deleteStart,
  deleteSuccess,
  deleteFail,
  signOut,
} from "../redux/user/userSlice.js";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function DashProfile() {
  const { currentUser, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [imageFile, setImageFile] = useState(null);
  const [imageFileURL, setImageFileURL] = useState(
    currentUser?.profilePicture || ""
  );
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);

  const [formData, setFormData] = useState({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filePickerRef = useRef();
  const placeholderImage = "https://via.placeholder.com/150";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageFileUploadError("Invalid file type. Please upload an image.");
      return;
    }
    setImageFile(file);
    setImageFileURL(URL.createObjectURL(file));
  };

  const uploadImage = useCallback(async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    setImageFileUploadProgress(null);
    try {
      if (!imageFile) return;

      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
      fd.append("cloud_name", "dwtgjddna");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", import.meta.env.VITE_CLOUDINARY_URL, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setImageFileUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const imgData = JSON.parse(xhr.responseText);
          const uploadedUrl = imgData.secure_url || imgData.url;
          setImageFileURL(uploadedUrl);
          setImageFileUploadProgress(100);
          // Store in formData too, but we'll also read imageFileURL directly on submit
          setFormData((f) => ({ ...f, profilePicture: uploadedUrl }));
        } else {
          setImageFileUploadError("Failed to upload image");
        }
        setImageFileUploading(false);
      };

      xhr.onerror = () => {
        setImageFileUploadError("Failed to upload image. Please try again.");
        setImageFileUploading(false);
        setImageFile(null);
        setImageFileURL(null);
      };

      xhr.send(fd);
    } catch {
      setImageFileUploadError("An unexpected error occurred while uploading.");
      setImageFileUploading(false);
      setImageFile(null);
      setImageFileURL(null);
    }
  }, [imageFile]);

  useEffect(() => {
    if (imageFile) uploadImage();
  }, [imageFile, uploadImage]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const nextValue = id === "username" ? value.toLowerCase() : value;
    setFormData((prev) => ({ ...prev, [id]: nextValue }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    // Merge the current uploaded image URL even if state not flushed yet
    const payload = { ...formData, profilePicture: imageFileURL };

    if (Object.keys(payload).length === 0) {
      setUpdateUserError("Please update at least one field.");
      return;
    }
    if (imageFileUploading) return;

    // validations
    if (payload.username !== undefined) {
      const normalized = String(payload.username).trim().toLowerCase();
      if (normalized.length < 7 || normalized.length > 20) {
        setUpdateUserError("Username must be between 7 and 20 characters");
        return;
      }
      if (/\s/.test(normalized)) {
        setUpdateUserError("Username cannot contain spaces");
        return;
      }
      if (!/^[a-z0-9]+$/.test(normalized)) {
        setUpdateUserError("Username must contain only letters and numbers");
        return;
      }
      payload.username = normalized;
    }
    if (payload.password && payload.password.length < 6) {
      setUpdateUserError("Password must be at least 6 characters");
      return;
    }
    if (!payload.password && payload.currentPassword) {
      delete payload.currentPassword;
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFail(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User profile updated successfully.");
      }
    } catch (err) {
      dispatch(updateFail(err.message));
      setUpdateUserError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) dispatch(deleteFail(data.message));
      else dispatch(deleteSuccess(data));
    } catch (err) {
      dispatch(deleteFail(err.message));
    }
  };

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
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62,152,199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={imageFileURL || placeholderImage}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-60"
            }`}
          />
        </div>

        {imageFileUploadError && <Alert color="failure">{imageFileUploadError}</Alert>}

        <TextInput
          type="text"
          id="username"
          placeholder="Username"
          defaultValue={currentUser?.username}
          minLength={7}
          maxLength={20}
          pattern="[a-z0-9]{7,20}"
          title="Username must be 7-20 characters, lowercase letters and numbers only"
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="Email"
          defaultValue={currentUser?.email}
          onChange={handleChange}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="Password"
          onChange={handleChange}
          autoComplete="new-password"
        />
        {formData?.password && (
          <TextInput
            type="password"
            id="currentPassword"
            placeholder="Current password (required to change)"
            onChange={handleChange}
            autoComplete="current-password"
          />
        )}

        <Button
          type="submit"
          className="border-2 text-blue-500 border-x-purple-500 border-y-blue-500 hover:text-white hover:border-transparent hover:bg-gradient-to-br hover:from-purple-500 hover:to-blue-500 rounded-md"
          pill
        >
          Update
        </Button>
      </form>

      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span
          className="cursor-pointer"
          onClick={async () => {
            try {
              const res = await fetch("/api/auth/signout", {
                method: "POST",
                credentials: "include",
              });
              if (res.ok) dispatch(signOut());
            } catch {
              // optional: handle error
            }
          }}
        >
          Sign Out
        </span>
      </div>

      {updateUserSuccess && <Alert color="success">{updateUserSuccess}</Alert>}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color="failure" className="mt-5">
          {error}
        </Alert>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="text-gray-500 dark:text-gray-200 h-14 w-14 mb-4 mx-auto text-5xl" />
            <h3 className="text-l font-semibold mb-5 dark:text-gray-400">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I&apos;m sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
