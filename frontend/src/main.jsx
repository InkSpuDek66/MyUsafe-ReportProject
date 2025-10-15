import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import ComplaintDetail from "./pages/ComplaintDetail/ComplaintDetail.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

frontend/src/main.jsx


// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>  
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/complaint/:id" element={<ComplaintDetail />} />
//     </Routes>
//   </BrowserRouter>
// );
