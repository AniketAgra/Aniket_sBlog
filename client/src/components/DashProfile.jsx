import { Alert, Button, Modal } from "flowbite-react";
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
import { HiOutlineExclamationCircle, HiTrash, HiOutlineLogout } from "react-icons/hi";
// Icons for inputs
import { HiUser, HiMail, HiLockClosed } from "react-icons/hi";
import GlassCard from "./admin/GlassCard";
// import '../../pages/dashboard.css';

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

  // Auto-dismiss success and error alerts
  useEffect(() => {
    if (updateUserSuccess) {
      const t = setTimeout(() => setUpdateUserSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [updateUserSuccess]);

  useEffect(() => {
    if (updateUserError) {
      const t = setTimeout(() => setUpdateUserError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [updateUserError]);

  return (
    <div className="max-w-2xl mx-auto px-3 w-full">
      <GlassCard className="p-6 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-300/90">Manage your account information.</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <input type="file" accept="image/*" onChange={handleImageChange} ref={filePickerRef} hidden />

          <div
            className="relative w-28 h-28 md:w-32 md:h-32 self-center cursor-pointer overflow-visible"
            onClick={() => filePickerRef.current.click()}
          >
            {/* glow ring */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-fuchsia-500/30 via-purple-500/30 to-cyan-500/30 blur" aria-hidden="true" />
            <div className="relative w-full h-full rounded-full shadow-md overflow-hidden ring-4 ring-white/10">
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
              className={`rounded-full w-full h-full object-cover ${
                imageFileUploadProgress &&
                imageFileUploadProgress < 100 &&
                "opacity-60"
              }`}
            />
            </div>
          </div>

          {imageFileUploadError && <Alert color="failure">{imageFileUploadError}</Alert>}

          {/* Username */}
          <div className="group relative p-[1.5px] rounded-3xl bg-gradient-to-r from-fuchsia-600/30 via-purple-600/30 to-cyan-600/30">
            <div className="rounded-3xl bg-slate-900/60 backdrop-blur-md ring-1 ring-white/10 transition-colors group-hover:bg-slate-900/70 group-focus-within:bg-slate-900/70 overflow-hidden">
              <div className="flex items-center gap-3 px-3">
                <HiUser className="shrink-0 text-slate-300/90" />
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  defaultValue={currentUser?.username}
                  minLength={7}
                  maxLength={20}
                  pattern="[a-z0-9]{7,20}"
                  title="Username must be 7-20 characters, lowercase letters and numbers only"
                  onChange={handleChange}
                  autoComplete="username"
                  className="dashboard-input w-full !border-0 focus:border-0 focus:ring-0 text-slate-100 placeholder-slate-400 !bg-transparent"
                />
              </div>
            </div>
          </div>  

          {/* Email */}
          <div className="group relative p-[1.5px] rounded-3xl bg-gradient-to-r from-fuchsia-600/30 via-purple-600/30 to-cyan-600/30">
            <div className="rounded-3xl bg-slate-900/60 backdrop-blur-md ring-1 ring-white/10 transition-colors group-hover:bg-slate-900/70 group-focus-within:bg-slate-900/70 overflow-hidden">
              <div className="flex items-center gap-3 px-3">
                <HiMail className="shrink-0 text-slate-300/90" />
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  defaultValue={currentUser?.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="dashboard-input w-full !bg-transparent !border-0 focus:border-0 focus:ring-0 text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="group relative p-[1.5px] rounded-3xl bg-gradient-to-r from-fuchsia-600/30 via-purple-600/30 to-cyan-600/30">
            <div className="rounded-3xl bg-slate-900/60 backdrop-blur-md ring-1 ring-white/10 transition-colors group-hover:bg-slate-900/70 group-focus-within:bg-slate-900/70 overflow-hidden">
              <div className="flex items-center gap-3 px-3">
                <HiLockClosed className="shrink-0 text-slate-300/90" />
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="dashboard-input w-full !bg-transparent !border-0 focus:border-0 focus:ring-0 text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
          {formData?.password && (
            <div className="group relative p-[1.5px] rounded-3xl bg-gradient-to-r from-fuchsia-600/30 via-purple-600/30 to-cyan-600/30">
              <div className="rounded-3xl bg-slate-900/60 backdrop-blur-md ring-1 ring-white/10 transition-colors group-hover:bg-slate-900/70 group-focus-within:bg-slate-900/70 overflow-hidden">
                <div className="flex items-center gap-3 px-3">
                  <HiLockClosed className="shrink-0 text-slate-300/90" />
                  <input
                    type="password"
                    id="currentPassword"
                    placeholder="Current password (required to change)"
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="dashboard-input w-full !bg-transparent !border-0 focus:border-0 focus:ring-0 text-slate-100 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl bg-black text-white border-purple-400 font-semibold shadow-lg hover:bg-white hover:text-black hover:font-semibold hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Update
          </Button>
        </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 text-red-400 hover:text-red-300">
          <HiTrash />
          Delete Account
        </button>
        <button
          className="inline-flex items-center gap-2 text-slate-300 hover:text-white"
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
          <HiOutlineLogout />
          Sign Out
        </button>
      </div>

  {updateUserSuccess && (
        <Alert color="success" className="mt-4">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-4">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color="failure" className="mt-4">
          {error}
        </Alert>
      )}

      {/* Themed modal to match the app's dark/glass style */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
        theme={{
          // keep Flowbite defaults for overlay; only change inner panel styling
          content: {
            base: "relative", // keep structure
            inner:
              "relative isolate rounded-2xl bg-slate-900/90 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85)] drop-shadow-[0_50px_90px_rgba(56,189,248,0.12)] before:content-[''] before:absolute before:-inset-10 before:rounded-[inherit] before:bg-black/70 before:blur-3xl before:opacity-60 before:-z-10",
          },
          header: {
            base: "flex items-center justify-end p-2",
            close: {
              base:
                "inline-flex items-center rounded-lg p-2 text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 transition",
              icon: "h-5 w-5",
            },
            title: "hidden",
          },
          body: { base: "p-6 text-center" },
        }}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-5 h-16 w-16 rounded-full ring-2 ring-white/10 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/20 to-cyan-600/20 grid place-items-center">
              <HiOutlineExclamationCircle className="h-9 w-9 text-slate-200" />
            </div>
      <h3 className="text-lg font-semibold mb-6 text-slate-100">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-3">
              <Button
                onClick={handleDeleteUser}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold px-5 py-2.5 shadow hover:from-rose-500 hover:to-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
              >
                Yes, I&apos;m sure
              </Button>
              <Button
                onClick={() => setShowModal(false)}
        className="rounded-xl bg-slate-800/60 text-slate-200 px-5 py-2.5 ring-1 ring-white/10 hover:bg-slate-800/80"
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
  </GlassCard>
    </div>
  );
}
