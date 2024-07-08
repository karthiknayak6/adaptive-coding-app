import React from "react";


export default function Intro() {
  return (
    <div className=" bg-[#332f2f] shadow-lg rounded-3xl py-8 px-10 mt-10 flex flex-col justify-center text-orange-100 ">
      <h3 className=" mx-10 text-2xl font-bold ">
        Welcome to CodeMastery!
      </h3>
      <div className="flex mt-6 justify-center items-center mx-10 text-orange-100">
        <img src="/home.png" className=" w-1/2 h-1/2" alt="Lingo Lounge Logo" />
        <p className="  text-xl ml-10 ">
        Unlock your coding potential with CodeMastery, the innovative platform that adapts to your skills and performance. Whether you're a seasoned coder or just starting, our system dynamically adjusts to ensure you're always challenged but never overwhelmed.
        </p>
      </div>
    </div>
  );
}