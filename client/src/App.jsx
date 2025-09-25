// import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import About from "../pages/about";
import Signup from "../pages/signup";
import Dashboard from "../pages/dashboard";
import Signin from "../pages/signin";
import ForgotPassword from "../pages/forgotPassword";
import ResetPassword from "../pages/resetPassword";
import Projects from "../pages/projects";
import Blog from "../pages/blog";
import PostPage from "../pages/post";
import ProjectPage from "../pages/project";
import HeaderCustom from "../src/components/HeaderCustom";
import FooterComponent from "./components/footer";
import PrivateRoute from "./components/PrivateRoute";

const app = () => {
  return(
    <BrowserRouter>
  <HeaderCustom/>
        <Routes>
            <Route path="/" element={<Home/>} ></Route>
            <Route path="/about" element={<About/>} ></Route>
            <Route path="/posts" element={<Blog/>} ></Route>
            {/* Support both slug and id for post detail */}
            <Route path="/posts/:slug" element={<PostPage/>} ></Route>
            <Route path="/posts/:id" element={<PostPage/>} ></Route>
            <Route path="/signup" element={<Signup/>} ></Route>
            <Route path="/signin" element={<Signin/>} ></Route>
            <Route path="/forgot-password" element={<ForgotPassword/>} ></Route>
            <Route path="/reset-password" element={<ResetPassword/>} ></Route>
            <Route element={<PrivateRoute/>}>      
                <Route path="/dashboard" element={<Dashboard/>} ></Route>
            </Route>
            <Route path="/projects" element={<Projects/>} ></Route>
            {/* Support both slug and id for project detail */}
          <Route path="/projects/:slug" element={<ProjectPage/>} ></Route>
          <Route path="/projects/:id" element={<ProjectPage/>} ></Route>
        </Routes>
        <FooterComponent/>
    </BrowserRouter>
  )
}

export default app;