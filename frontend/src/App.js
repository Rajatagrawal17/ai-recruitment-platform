import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import NotificationCenter from "./components/NotificationCenter";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Verification from "./pages/Verification";
import Jobs from "./pages/Jobs";
import ApplyJob from "./pages/ApplyJob";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <Router>
      <NotificationCenter />
      <Navbar />
      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/apply/:jobId" element={<ApplyJob />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;