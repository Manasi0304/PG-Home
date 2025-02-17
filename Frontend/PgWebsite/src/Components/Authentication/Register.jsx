import React, { useState } from "react";
import { FaUnlockAlt, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Add Toastify CSS
import './Login.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register/send-otp", {
        firstName, lastName, email, password,
      });
      toast.success(res.data.alert);  // Ensure the correct alert message
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.alert || "❌ Registration failed.");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register/verify-otp", {
        email, otp,
      });
      toast.success(res.data.alert);  // Ensure the correct alert message
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.alert || "❌ OTP verification failed.");
    }
  };

  return (
    <section className="registerForm">
      <div className="formDiv">
        {step === 1 ? (
          <form onSubmit={sendOtp}>
            <h2>CUSTOMER REGISTER</h2>
            <div className="inpt">
              <FaUser />
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="inpt">
              <FaUser />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="inpt">
              <MdEmail />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="inpt">
              <FaUnlockAlt />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn2">SEND OTP</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <h2>VERIFY OTP</h2>
            <div className="inpt">
              <MdEmail />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn2">VERIFY</button>
          </form>
        )}
        <Link to="/login" className="link">LOGIN</Link>
      </div>
    </section>
  );
};

export default Register;
