import React from "react";

const Banner = () => {
  return (
    <div className="w-full h-[300px] bg-cover bg-center relative" style={{ backgroundImage: "url('/banner.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-3xl font-bold">
        GIÀY BÓNG RỔ
      </div>
    </div>
  );
};

export default Banner;
