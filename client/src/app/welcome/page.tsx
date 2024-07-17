"use client";

import React from "react";

import Intro from "@/components/Intro";
import Working from "@/components/Working";
import ButtonOrange from "@/components/ButtonOrange";
import { useRouter } from "next/navigation";
export default function page() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center container">
      <Intro />
      <Working />
      <div>
        <ButtonOrange
          className="mt-6 px-5 py-2 mb-10"
          onClick={() => {
            router.push("/login");
          }}
        >
          Get Started
        </ButtonOrange>
      </div>
    </div>
  );
}
