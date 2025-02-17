import React, { useState } from 'react';
import { MdEmail } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/reset_password", { email });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <section className="registerForm">
      <div className="formDiv">
        <form onSubmit={submit}>
          <h2>FORGOT PASSWORD</h2>
          <div className="inpt">
            <MdEmail />
            <input type="email" placeholder="Email ID" required onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn2">SUBMIT</button>
        </form>
        <Link to="/login" className="link">LOGIN</Link>
      </div>
    </section>
  );
};

export default ForgotPassword;
