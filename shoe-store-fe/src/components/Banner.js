import React from "react";
import { useState, useEffect } from "react";
const bannerImages = [
  "/images/banner1.webp",
  "/images/banner2.webp",
  "/images/banner3.webp",
];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 4000); // Chuyển ảnh mỗi 4 giây

    return () => clearInterval(interval); // Clear interval khi component unmount
  }, []);

   // Nút quay lại
   const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  };

  // Nút tiếp theo
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
  };

  return (
    <div
      className="w-full h-[500px] bg-cover bg-center transition-all duration-700 ease-in-out relative"
      style={{
        backgroundImage: `url(${bannerImages[currentIndex]})`,
      }}
    >
      {/* Overlay đen */}
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold drop-shadow">
        </h1>
      </div>

      {/* Nút trái */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        &#10094;
      </button>

      {/* Nút phải */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        &#10095;
      </button>
    </div>
  );
};

export default Banner;
