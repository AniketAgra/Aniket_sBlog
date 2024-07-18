// import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import About from "../pages/about";
import Signup from "../pages/signup";
import Dashboard from "../pages/dashboard";
import Signin from "../pages/signin";
import Projects from "../pages/projects";


const app = () => {
  return(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>} ></Route>
            <Route path="/about" element={<About/>} ></Route>
            <Route path="/signup" element={<Signup/>} ></Route>
            <Route path="/signin" element={<Signin/>} ></Route>
            <Route path="/dashboard" element={<Dashboard/>} ></Route>
            <Route path="/projects" element={<Projects/>} ></Route>
        </Routes>
    </BrowserRouter>
  )
}

export default app;