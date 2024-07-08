import React from "react";
import Intro from "@/components/Intro";
import Working from "@/components/Working";
export default function Home() {
  return (
    <>
      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-10 flex flex-col justify-center text-orange-100">
        <div className="flex mt-6 justify-center items-center mx-10">
          <div className=" text-lg ml-10">
            <h2 className="text-5xl font-bold mb-4">Welcome, Karthik!</h2>

            <p className="mt-6 text-xl">
              Join CodeMastery today and experience a personalized coding
              adventure that evolves with you, helping you become the best coder
              you can be!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-10 flex flex-col justify-center text-orange-100">
        <div className="flex justify-center items-center mx-10 bg-[#332f2f]">
          <div className="text-4xl text-orange-200 font-bold">
            Choose a path!
          </div>
        </div>
      </div>
      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-10 flex flex-col justify-center text-orange-100">
        <div className="flex justify-center items-center mx-10">
          <div className=" text-orange-100  flex">
            <img alt="ds" src="/ds2.png" width={250} height={100} />
            <div className="px-10">
              <div className="text-4xl">
                Data Structures and Algorithms (Beginner)
              </div>
              <p className="text-lg mt-10">
                Start your coding journey with our beginner-friendly course on
                data structures and algorithms. Learn the fundamental concepts,
                engage with interactive tutorials, and build a strong foundation
                to solve complex problems efficiently. Choose this path to
                master essential skills and advance your career in tech!
              </p>
              <button className="mt-8 px-6 py-3 w-40 bg-orange-600 text-white text-lg font-medium rounded-full shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition ease-in-out duration-300">
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-10 flex flex-col justify-center text-orange-100">
        <div className="flex justify-center items-center mx-10">
          <div className=" text-orange-100  flex">
            <img alt="ds" src="/alg0.png" width={250} height={100} />
            <div className="px-10">
              <div className="text-4xl">
                Data Structures and Algorithms (Intermediate)
              </div>
              <p className="text-lg mt-10">
                Start your coding journey with our intermediate course on data
                structures and algorithms. Learn the fundamental concepts,
                engage with interactive tutorials, and build a strong foundation
                to solve complex problems efficiently. Choose this path to
                master essential skills and advance your career in tech!
              </p>
              <button
                disabled
                className="mt-8 px-6 py-3 w-44 bg-orange-400 text-white text-lg font-medium rounded-full shadow-md  focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition ease-in-out duration-300"
              >
                coming soon...
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
