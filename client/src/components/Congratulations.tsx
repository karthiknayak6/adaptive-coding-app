import React from "react";
import ButtonOrange from "./ButtonOrange";
import { ProblemResponse } from "@/app/problems/[problemId]/page";
import { useRouter } from "next/navigation";

interface Props {
  setShowPassed: React.Dispatch<React.SetStateAction<boolean>>;
  finalTime: string;
  res: ProblemResponse | undefined;
}

export default function Congratulations({
  setShowPassed,
  finalTime,
  res,
}: Props) {
  const router = useRouter();
  const handleNextProblem = () => {
    if (res && res.problemId) {
      router.push(`/problems/${parseInt(res?.problemId) + 1}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#292828] h-auto w-1/2 text-white flex items-center justify-center flex-col rounded-2xl p-8 space-y-4">
        <div
          className="cursor-pointer self-end"
          onClick={() => {
            setShowPassed(false);
          }}
        >
          ✖
        </div>
        <div className="text-orange-200 font-bold text-3xl">
          Congratulations!!
        </div>
        <div className="text-xl text-orange-50">
          Your solution has been accepted!
        </div>
        <div className="text-lg text-orange-100">
          <p>
            Time taken to solve the problem: <span>{finalTime}</span>
          </p>
          <p>
            Runtime of your program: <span>{res?.totalTimeTaken} ms</span>
          </p>
        </div>
        <ButtonOrange className="px-2 py-1" onClick={handleNextProblem}>
          Go to next problem
        </ButtonOrange>
      </div>
    </div>
  );
}
