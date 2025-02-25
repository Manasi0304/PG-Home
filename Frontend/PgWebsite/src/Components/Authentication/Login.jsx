import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { FaUnlockAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      toast.success(res.data.alert);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.alert || "❌ Login failed. Please try again.");
    }
  };

  return (
    <section className="registerForm">
      <div className="formDiv">
        <form onSubmit={submit}>
          <h2>CUSTOMER LOGIN</h2>
          <div className="inpt">
            <MdEmail />
            <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="inpt">
            <FaUnlockAlt />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn2">LOGIN</button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            <Link to="/forgot-password" style={{ color: "#fff", textDecoration: "underline" }}>Forgot Password?</Link>
          </p>
        </form>

        <Link to="/register" className="link">REGISTER</Link>
      </div>
    </section>
  );
};

export default Login;
