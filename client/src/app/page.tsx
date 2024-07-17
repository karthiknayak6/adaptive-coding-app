"use client";
import React from "react";
import Intro from "@/components/Intro";
import Working from "@/components/Working";
import ButtonOrange from "@/components/ButtonOrange";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
export default function Home() {
  const router = useRouter();

  let user = localStorage.getItem("user");

  if (user) {
    user = JSON.parse(user);
  }

  if (!user) {
    router.push("/welcome");
  }
  return (
    <div className="container">
      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-7 flex flex-col justify-center text-orange-100 ">
        <div className="flex mt-6 justify-center items-center mx-10">
          <div className=" text-lg ml-10">
            <h2 className="text-5xl font-bold mb-4">Welcome, Karthik!</h2>

            <p className="mt-6 text-lg">
              Join CodeMastery today and experience a personalized coding
              adventure that evolves with you, helping you become the best coder
              you can be!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-4 mt-10 flex flex-col justify-center text-orange-100">
        <div className="flex justify-center items-center mx-10 bg-[#332f2f]">
          <div className="text-3xl text-orange-200 font-bold">
            Choose a path!
          </div>
        </div>
      </div>
      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-10 flex flex-col justify-center text-orange-100">
        <div className="flex justify-center items-center mx-10">
          <div className=" text-orange-100  flex">
            <img alt="ds" src="/ds2.png" width={150} height={100} />
            <div className="px-10">
              <div className="text-3xl">
                Data Structures and Algorithms (Beginner)
              </div>
              <p className=" mt-2">
                Start your coding journey with our beginner-friendly course on
                data structures and algorithms. Learn the fundamental concepts,
                engage with interactive tutorials, and build a strong foundation
                to solve complex problems efficiently. Choose this path to
                master essential skills and advance your career in tech!
              </p>
              <ButtonOrange
                className="px-4 py-1 mt-4"
                onClick={() => router.push("/problems/1")}
              >
                Start
              </ButtonOrange>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-5 flex flex-col justify-center text-orange-100 mb-20">
        <div className="flex justify-center items-center mx-10">
          <div className=" text-orange-100  flex">
            <img alt="ds" src="/alg0.png" width={150} height={100} />
            <div className="px-10">
              <div className="text-3xl">
                Data Structures and Algorithms (Intermediate)
              </div>
              <p className=" mt-2">
                Start your coding journey with our intermediate course on data
                structures and algorithms. Learn the fundamental concepts,
                engage with interactive tutorials, and build a strong foundation
                to solve complex problems efficiently. Choose this path to
                master essential skills and advance your career in tech!
              </p>
              <ButtonOrange disabled className="px-4 py-1 mt-4 bg-orange-300">
                Coming soon..
              </ButtonOrange>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-5 flex flex-col justify-center text-orange-100">
        <div className="flex justify-center items-center mx-10">
          <div className=" text-orange-100  flex">
            <img
              className=""
              alt="ds"
              src="/alg0.png"
              width={250}
              height={100}
            />
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
              <ButtonOrange disabled className="px-6 py-1 mt-4">
                coming soon...
              </ButtonOrange>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
