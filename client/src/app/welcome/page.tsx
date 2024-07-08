import React from "react";

import Intro from "@/components/Intro";
import Working from "@/components/Working";
export default function page() {
  return (
    <div className="flex flex-col items-center">
      <Intro />
      <Working />
      <div>
        <button className="mt-8 px-6 py-3 w-40 bg-orange-600 text-white text-lg font-medium rounded-full shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition ease-in-out duration-300">
          Get Started
        </button>
      </div>
    </div>
  );
}
