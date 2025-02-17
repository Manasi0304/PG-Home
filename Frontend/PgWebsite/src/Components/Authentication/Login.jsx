// src/components/Authentication/Login.jsx
import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { FaUnlockAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      toast.success(res.data.message);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="registerForm">
      <div className="formDiv">
        <form onSubmit={submit}>
          <h2>CUSTOMER LOGIN</h2>
          <div className="inpt">
            <MdEmail />
            <input
              type="email"
              placeholder="Email ID"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="inpt">
            <FaUnlockAlt />
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div id="linkDiv">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" className="btn2">
            LOGIN
          </button>
        </form>
        <Link to="/register" className="link">
          REGISTER
        </Link>
      </div>
    </section>
  );
};

export default Login;
