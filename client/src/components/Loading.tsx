import React from "react";
import { BallTriangle } from "react-loader-spinner";

export default function Loading() {
  return (
    <div className="fixed top-1/2 left-1/2">
      <BallTriangle
        height={100}
        width={100}
        radius={5}
        color="#f78a4f"
        ariaLabel="ball-triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
}
