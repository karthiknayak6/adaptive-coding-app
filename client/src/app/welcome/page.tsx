import React from "react";

import Intro from "@/components/Intro";
import Working from "@/components/Working";
import ButtonOrange from "@/components/ButtonOrange";
export default function page() {
  return (
    <div className="flex flex-col items-center container">
      <Intro />
      <Working />
      <div>
        <ButtonOrange>Get Started</ButtonOrange>
      </div>
    </div>
  );
}
