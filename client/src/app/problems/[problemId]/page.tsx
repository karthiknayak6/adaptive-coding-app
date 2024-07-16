"use client";
import React, { useEffect, useState, KeyboardEvent } from "react";
import { useRouter, useParams } from "next/navigation"; // Only import this
import Editor from "@monaco-editor/react";
import ButtonOrange from "@/components/ButtonOrange";
import TestCase from "@/components/TestCase";
import axios from "axios";

let backendUrl = "http://localhost:8080";

interface KeyValue {
  Key: string;
  Value: number | number[];
}

interface TestCase {
  test_case_id: number;
  input: KeyValue[];
  output: number[];
}

interface Problem {
  id: number;
  title: string;
  description: string;
  boilerplate: string;
  difficulty: string;
  test_cases: TestCase[];
}

const Page: React.FC = () => {
  const params = useParams();
  const problemId = params.problemId;

  console.log("ProblemId: ", problemId);
  const [CodeSeg, setCodeSeg] = useState<string>("");
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<number>(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [submission, setSubmission] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const init = async () => {
    if (!problemId) return; // Ensure problemId is available
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/suggest/${problemId}`);
      setProblem(response.data);
      if (response.data.test_cases.length > 0) {
        setTestCase(response.data.test_cases[0]);
      }
    } catch (err) {
      setError("Failed to fetch problem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [problemId]); // Re-run init when problemId changes

  useEffect(() => {
    if (problem && problem.test_cases.length > 0) {
      setTestCase(problem.test_cases[0]);
    }
  }, [problem]);

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

  const handleEditorChange = (value: string | undefined) => {
    setSubmission(value || "");
    console.log("my sub", submission);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${backendUrl}/submission`, {
        problemId: problemId,
        submission: submission,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : problem ? (
        <div
          id="problempage"
          className="flex justify-center px-1 space-x-8 text-white mt-7 mx-6"
        >
          <div className="w-1/2">
            <h1 className="text-4xl font-bold mb-5 text-orange-100">
              {problem.title}
            </h1>
            <h5 className="text-xl font-bold">Description:</h5>
            <div className="description-scrollable">
              <p className="text-lg">{problem.description}</p>
            </div>
            {problem.test_cases.length > 0 && (
              <div className="flex flex-col mt-5">
                <code className="text-lg">
                  Input:
                  {problem.test_cases[0].input.map((kv, index) => (
                    <div key={index}>
                      {kv.Key}:{" "}
                      {Array.isArray(kv.Value)
                        ? JSON.stringify(kv.Value)
                        : kv.Value}
                    </div>
                  ))}
                </code>
                <code className="text-lg">
                  Output: {JSON.stringify(problem.test_cases[0].output)}
                </code>
              </div>
            )}
          </div>
          <div className="code w-2/3">
            <div className="code-form flex flex-col">
              <div>
                <select
                  title="language"
                  name="language"
                  className="w-24 h-8 text-sm bg-[#3c3939] rounded-full  py-1 pl-4 mb-2"
                >
                  <option value={"python3"}>Python3</option>
                </select>
              </div>
              <Editor
                height="50vh"
                width={"100%"}
                options={{
                  scrollBeyondLastLine: false,
                  fontSize: 16,
                }}
                theme="vs-dark"
                defaultLanguage="python"
                defaultValue={problem.boilerplate}
                onChange={handleEditorChange}
              />

              <div className="flex space-x-4  mt-3 rounded-full py-2 bg-[#332f2f]">
                <ButtonOrange className="w-20 py-0  h-7 text-sm ml-3">
                  Run
                </ButtonOrange>
                <ButtonOrange className="w-20 py-0  h-7 text-sm">
                  Reset
                </ButtonOrange>
                <ButtonOrange
                  className="w-20 py-0  h-7 text-sm"
                  type="submit"
                  id="submit"
                  onClick={handleSubmit}
                >
                  Submit
                </ButtonOrange>
              </div>

              {testCase && (
                <div className="bg-[#332f2f] shadow-lg rounded-3xl py-0 mt-3 justify-center text-orange-100 ">
                  <div className="bg-[#544f4f] rounded-t-3xl pt-2 pl-8 pb-2">
                    Test cases
                  </div>
                  <div>
                    <div className="bg-[#433e3e]  pt-3 pl-8 pb-3 flex justify-evenly">
                      {problem.test_cases.map((tc, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setTestCase(tc);
                            setSelectedTestCase(index);
                          }}
                          className={`py-[6px] text-sm rounded-full px-3 cursor-pointer hover:bg-orange-400 ${
                            selectedTestCase === index
                              ? "bg-orange-500 text-white"
                              : "bg-orange-300 text-black"
                          }`}
                        >
                          Test Case {index + 1}
                        </div>
                      ))}
                    </div>
                    <div className="">
                      <TestCase testCase={testCase} />
                    </div>
                  </div>
                </div>
              )}
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
