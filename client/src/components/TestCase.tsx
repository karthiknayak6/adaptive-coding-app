import React from "react";
import type {
  ProblemResponse,
  TestCase as TestCaseType,
} from "@/app/problems/[problemId]/page";

interface KeyValue {
  Key: string;
  Value: number | number[];
}

interface TestCaseProps {
  testCase: TestCaseType;
  res: ProblemResponse | undefined;
}

export default function TestCase({ testCase, res }: TestCaseProps) {
  const testResult = res?.tests.find(
    (t) => t.testcaseid === testCase.test_case_id
  );
  const isPassed = testResult?.actualOutput === testResult?.expectedOutput;

  return (
    <div className="mb-6">
      <div className="bg-[#433e3e] mt-3 py-3 pl-8 ">
        <span className="font-bold mr-2">Input: </span>
        <span>
          {testCase.input.map((item, index) => (
            <span key={index}>
              {item.Key}:{" "}
              {Array.isArray(item.Value)
                ? JSON.stringify(item.Value)
                : item.Value}
              {index < testCase.input.length - 1 ? ", " : ""}
            </span>
          ))}
        </span>
      </div>
      <div className="bg-[#433e3e] mt-3 pl-8 py-3">
        <span className="font-bold mr-2">Target: </span>
        <span>{JSON.stringify(testCase.output)}</span>
      </div>
      {res && (
        <div className="bg-[#433e3e] mt-3 pl-8 py-3">
          <span className="font-bold mr-2">Your Output: </span>
          <span className={isPassed ? "text-green-500" : "text-red-500"}>
            {JSON.stringify(testResult?.actualOutput)}
          </span>
        </div>
      )}
      {res && (
        <div className="bg-[#433e3e] mt-3 pl-8 py-3">
          <span className="font-bold mr-2">Expected Output: </span>
          <span>{JSON.stringify(testResult?.expectedOutput)}</span>
        </div>
      )}
    </div>
  );
}
