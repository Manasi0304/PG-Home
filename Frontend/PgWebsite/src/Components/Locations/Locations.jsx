import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "./Locations.css";

import hadapsar from "../../assets/hadapsar.jpg";
import wagholi from "../../assets/wagholi.jpg";
import kondhwa from "../../assets/kondhwa.jpg";
import katraj from "../../assets/katraj.jpg";
import kothrud from "../../assets/kothrud.jpg";

import dark_arrow from "../../assets/dark-arrow.png";

const Locations = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 1024, // Tablets
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600, // Mobile devices
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="locations container">
      <Slider {...settings} className="gallery">
        <div>
          <img src={hadapsar} alt="Hadapsar" />
          <p>Hadapsar</p>
        </div>
        <div>
          <img src={wagholi} alt="Wagholi" />
          <p>Wagholi</p>
        </div>
        <div>
          <img src={kondhwa} alt="Kondhwa" />
          <p>Kondhwa</p>
        </div>
        <div>
          <img src={katraj} alt="Katraj" />
          <p>Katraj</p>
        </div>
        <div>
          <img src={kothrud} alt="Kothrud" />
          <p>Kothrud</p>
        </div>
      </Slider>
      <button className="btn ">
        See More Here <img src={dark_arrow} alt="arrow" />
      </button>
    </div>
  );
};

export default Locations;
