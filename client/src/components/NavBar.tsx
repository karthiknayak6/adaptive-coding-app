"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function Navbar() {
  
  const router = useRouter();


  const handleLogOut = async () => {
   
  };

  return (
    <nav className=" bg-white shadow-md p-4  w-full">
      <div className=" container mx-auto">
        <div className="flex items-center justify-between">
          <div
            onClick={() => router.push("/")}
            className=" text-2xl font-bold text-purple-800 cursor-pointer  "
          >
            SmarTrack
          </div>
          <div className="flex space-x-4">
            {true && <a
              href="/login"
              className=" hover:text-gray-400 font-medium text-gray-700 text-lg"
            >
              Login
            </a>}

            {false && <a
              onClick={handleLogOut}
              className=" hover:text-gray-400 text-red-600 font-semibold text-lg cursor-pointer"
            >
              Log out
            </a>}
          </div>
        </div>
      </div>
    </nav>
  );
}