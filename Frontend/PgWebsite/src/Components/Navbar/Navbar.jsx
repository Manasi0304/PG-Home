import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navColor, setNavColor] = useState("dark-nav"); // Default navbar color

  // Function to handle scroll event
  const handleScroll = () => {
    if (window.scrollY > 50) {
      setNavColor("dark-nav"); // Change to blue when scrolled down
    } else {
      setNavColor("dark-nav"); // Default dark navbar
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Google Translate Integration
  useEffect(() => {
    const googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    if (!window.googleTranslateElementInit) {
      const addScript = document.createElement("script");
      addScript.setAttribute(
        "src",
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      );
      document.body.appendChild(addScript);
      window.googleTranslateElementInit = googleTranslateElementInit;
    }
  }, []);

  return (
    <nav className={`container ${navColor}`}>
      <img src="" alt="LOGO" className="logo" />

      {/* Mobile Menu Icon */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <ul className={menuOpen ? "nav-links active" : "nav-links"}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/add-property">List Your Hostel/PG </Link>
        </li>
        <li>
          <Link to="/properties">Find PG</Link>
        </li>

        {/* Dropdown Menu for Explore */}
        <li
          className="dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          Explore ▼
          {dropdownOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/contact-us">Contact Us</Link>
              </li>
              <li>
                <Link to="/testimonials">Testimonials</Link>
              </li>
              <li>
                <Link to="/locations">Locations</Link>
              </li>
              <li>
                <Link to="/about-us">About Us</Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <button className="btn">Login/SignUp</button>
        </li>
      </ul>

      {/* Google Translate Element */}
      <div id="google_translate_element"></div>
    </nav>
  );
};

export default Navbar;
