// src/components/Authentication/Register.jsx
import React, { useState } from "react";
import { FaUnlockAlt, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css";



const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", {
        firstName,
        lastName,
        email,
        password,
      });
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="registerForm">
      <div className="formDiv">
        <form onSubmit={submit}>
          <h2>CUSTOMER REGISTER</h2>
          <div className="inpt">
            <FaUser />
            <input
              type="text"
              placeholder="Your First Name"
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="inpt">
            <FaUser />
            <input
              type="text"
              placeholder="Your Last Name"
              required
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="inpt">
            <MdEmail />
            <input
              type="email"
              placeholder="Your Email"
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
          <button type="submit" className="btn2">
            REGISTER
          </button>
        </form>
        <Link to="/login" className="link">
          LOGIN
        </Link>
      </div>
    </section>
  );
};

export default Register;
