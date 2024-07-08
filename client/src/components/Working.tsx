import React from "react";


export default function Working() {
    return (
      <div className="bg-[#332f2f] shadow-lg rounded-3xl py-8 mt-10 flex flex-col justify-center text-orange-100">
        <div className="flex mt-6 justify-center items-center mx-10">
          <div className=" text-lg ml-10">
            <h2 className="text-2xl font-bold mb-4">How It Works:</h2>
            <ul className="list-disc list-inside space-y-4">
              <li>
                <strong className="font-semibold">Adaptive Progression:</strong> As you solve problems, our algorithm evaluates your performance. If you excel, you'll swiftly move to more challenging problems, maximizing your learning efficiency. If you struggle, you'll receive additional practice at the current level, reinforcing your skills and building confidence.
              </li>
              <li>
                <strong className="font-semibold">Performance Metrics:</strong> We consider the time you take, the efficiency of your solutions, and the memory usage of your programs. These metrics guide our adaptive algorithm to tailor the perfect learning path for you.
              </li>
              <li>
                <strong className="font-semibold">Comprehensive Problem Set:</strong> With a carefully curated collection of 20 problems, CodeMastery covers a wide range of difficulties and concepts. Our goal is to ensure you experience a balanced and thorough coding journey.
              </li>
            </ul>
            <p className="mt-6 text-xl">
              Join CodeMastery today and experience a personalized coding adventure that evolves with you, helping you become the best coder you can be!
            </p>
          </div>
        </div>
      </div>
    );
  }
  