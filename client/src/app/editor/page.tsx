"use client";
import ButtonOrange from "@/components/ButtonOrange";
import React, { useEffect, useState, KeyboardEvent } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
// import "./ProblemsPage.css";
let backendUrl = "http://127.0.0.1:8000";

interface Problem {
  title: string;
  description: string;
  difficulty: string;
  exampleIn: string;
  exampleOut: string;
  testCases: { input: string; output: string }[];
}

const Page: React.FC = () => {
  const [CodeSeg, setCodeSeg] = useState<string>("");
  //   const { pid } = useParams<{ pid: string }>();
  let pid: string = "787h";
  const cleanId: string = pid.substring(1);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [submission, setSubmission] = useState<string>("");

  const init = async () => {
    // const response = await fetch(`${backendUrl}/problem/` + cleanId, {
    //   method: "GET",
    // });
    // const json = await response.json();
    // setProblem(json.problem);
    setProblem({
      title: "Two Sum",
      description:
        "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      difficulty: "Easy",
      exampleIn: "2,7,11,15",
      exampleOut: "0,1",
      testCases: [
        {
          input: "2,7,11,15",
          output: "0,1",
        },
        {
          input: "3,2,4",
          output: "1,2",
        },
        {
          input: "2,7,11,15",
          output: "0,1",
        },
        {
          input: "3,2,4",
          output: "1,2",
        },
      ],
    });
  };

  useEffect(() => {
    init();
  }, []);
  // console.log(cleanId);

  const handleKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const { selectionStart, selectionEnd, value } = target;
      const val =
        value.substring(0, selectionStart) +
        "\t" +
        value.substring(selectionStart);
      target.value = val;
      target.selectionStart = target.selectionEnd = selectionStart + 1;
    }
    setCodeSeg(event.currentTarget.value);
  };

  return (
    <div>
      {problem ? (
        <div
          id="problempage"
          className="flex justify-center  px-1 space-x-8 text-white mt-10 mx-6 "
        >
          <div className=" w-1/2">
            <h1 className="text-4xl font-bold mb-5 text-orange-100">
              {problem.title}
            </h1>
            <h5 className="text-xl font-bold">Description:</h5>
            <p className="text-lg">{problem.description}</p>
            <div className="flex  flex-col mt-5">
              <code className="text-lg">Input : {problem.exampleIn}</code>
              <code className="text-lg">Output : {problem.exampleOut}</code>
            </div>
          </div>
          <div className="code w-1/2">
            {/* <h1>Code Here</h1> */}
            <div className="code-form flex flex-col">
              {/* <textarea
                className="text-black"
                rows={20}
                cols={70}
                placeholder="Enter Code Here"
                onChange={(e) => setSubmission(e.target.value)}
                name="SolvedCode"
                onKeyDown={(event) => handleKey(event)}
              ></textarea> */}
              <Editor
                height="40vh"
                width={"100%"}
                theme="vs-dark"
                defaultLanguage="javascript"
                defaultValue="function twoSum(nums, target) {
                  /* Write your code here */
                }
                "
              />

              <div className="flex space-x-4 items-center justify-evenly mt-3 rounded-full py-4 bg-[#332f2f]">
                <ButtonOrange className="w-30 py-2 px-8  h-15 text-sm">
                  Run
                </ButtonOrange>
                <ButtonOrange
                  className="w-30 py-2 px-8  h-15 text-sm"
                  type="submit"
                  id="submit"
                  onClick={async () => {
                    const response = await fetch(`${backendUrl}/submission`, {
                      method: "POST",
                      headers: {
                        authorization: localStorage.getItem("token") || "",
                      },
                      body: JSON.stringify({
                        problemId: cleanId,
                        submission: submission,
                      }),
                    });

                    const json = await response.json();
                    console.log(json);
                  }}
                >
                  Submit
                </ButtonOrange>
              </div>

              <div className="bg-[#332f2f] shadow-lg rounded-3xl py-0 mt-3 flex flex-col justify-center text-orange-100">
                <div className="flex justify-center items-center mx-10">
                  <div className=" text-lg ml-10">Test cases</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>The searched Question Doesn't exist</div>
      )}
    </div>
  );
};

export default Page;
