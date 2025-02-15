import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Title from "./components/Title/Title";
import About from "./components/About/About";
import Locations from "./components/Locations/Locations";
import Testimonials from "./components/Testimonials/Testimonials";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";
import Category from "./components/Category/Category";
import Home from "./pages/Home";
import AddNewProperty from "./pages/AddNewProperty";
import PropertyList from "./pages/PropertyList";
import NewPropertyDetails from "./pages/NewPropertyDetails";
import PropertyFilters from "./pages/PropertyFilters";
import Chatbot from "./components/Chatbot/Chatbot"; // Fixed import path

// Separate component for Home Page Sections
const HomePageSections = () => (
  <div className="container">
    <div id="locations">
      <Title subTitle="Search by Location" title="Locations" />
      <Locations />
    </div>

    <Category />

    <div id="about-us">
      <About />
    </div>

    <div id="testimonials">
      <Title subTitle="Testimonials" title="What Residents Say!!" />
      <Testimonials />
    </div>

    <div id="contact-us">
      <Title subTitle="Get in Touch" title="Schedule a Visit Today!" />
      <Contact />
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<><Hero /><HomePageSections /></>} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/property/:id" element={<NewPropertyDetails />} />
        <Route path="/add-property" element={<AddNewProperty />} />
        <Route path="/property-filters" element={<PropertyFilters />} />
      </Routes>

      <Footer />
      <Chatbot />
    </Router>
  );
};

export default App;
