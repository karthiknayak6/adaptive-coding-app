import React from "react";

interface KeyValue {
  Key: string;
  Value: number | number[];
}

interface TestCaseProps {
  testCase: {
    input: KeyValue[];
    output: number[];
  };
}

export default function TestCase({ testCase }: TestCaseProps) {
  return (
    <div className="">
      <div className="bg-[#433e3e] mt-5 h-16 pt-3 pl-8 pb-2">
        <span>Input: </span>
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
      <div className="bg-[#433e3e] mt-5 h-16 pt-3 pl-8 pb-2">
        <span>Target: </span>
        <span>{JSON.stringify(testCase.output)}</span>
      </div>
    </div>
  );
}
