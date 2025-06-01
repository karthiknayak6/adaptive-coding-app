"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type TestCase = {
  test_case_id: number;
  input: any;
  output: any;
};

type Problem = {
  title: string;
  description: string;
  difficulty: string;
  boilerplate: string;
  test_cases: TestCase[];
};

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (problem: Problem) => void;
}

// Custom dark overlay component
const DarkDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
DarkDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Custom dialog content to use the dark overlay
const DarkDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DarkDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full bg-stone-800 border-stone-700 text-white",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DarkDialogContent.displayName = DialogPrimitive.Content.displayName;

export default function AddProblemModal({
  isOpen,
  onClose,
  onAdd,
}: AddProblemModalProps) {
  const [problem, setProblem] = useState<Problem>({
    title: "",
    description: "",
    difficulty: "medium",
    boilerplate: "",
    test_cases: [],
  });

  const [testCases, setTestCases] = useState<
    Array<{ input: string; output: string }>
  >([{ input: "", output: "" }]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProblem((prev) => ({ ...prev, [name]: value }));
  };

  const handleDifficultyChange = (value: string) => {
    setProblem((prev) => ({ ...prev, difficulty: value }));
  };

  const handleTestCaseChange = (
    index: number,
    field: "input" | "output",
    value: string
  ) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index][field] = value;
    setTestCases(updatedTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "" }]);
  };

  const removeTestCase = (index: number) => {
    const updatedTestCases = [...testCases];
    updatedTestCases.splice(index, 1);
    setTestCases(updatedTestCases);
  };

  const handleSubmit = () => {
    const formattedTestCases = testCases.map((tc, index) => {
      let parsedInput;
      let parsedOutput;
      try {
        parsedInput = JSON.parse(tc.input);
      } catch (e) {
        parsedInput = tc.input;
      }
      try {
        parsedOutput = JSON.parse(tc.output);
      } catch (e) {
        parsedOutput = tc.output;
      }
      return {
        test_case_id: index + 1,
        input: parsedInput,
        output: parsedOutput,
      };
    });
    const newProblem = { ...problem, test_cases: formattedTestCases };
    onAdd(newProblem);
    setProblem({
      title: "",
      description: "",
      difficulty: "medium",
      boilerplate: "",
      test_cases: [],
    });
    setTestCases([{ input: "", output: "" }]);
  };

  const validateForm = () => {
    return (
      problem.title.trim() !== "" &&
      problem.description.trim() !== "" &&
      problem.boilerplate.trim() !== "" &&
      testCases.every((tc) => tc.input.trim() !== "" && tc.output.trim() !== "")
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DarkDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Problem</DialogTitle>
          <DialogDescription className="text-gray-300">
            Create a new coding problem with test cases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Problem title"
              value={problem.title}
              onChange={handleChange}
              className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Problem description with instructions"
              rows={4}
              value={problem.description}
              onChange={handleChange}
              className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-gray-300">
              Difficulty
            </Label>
            <Select
              value={problem.difficulty}
              onValueChange={handleDifficultyChange}
            >
              <SelectTrigger className="bg-stone-700 border-stone-600 text-white">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-stone-700 border-stone-600 text-white">
                <SelectItem value="easy" className="hover:bg-stone-600">
                  Easy
                </SelectItem>
                <SelectItem value="medium" className="hover:bg-stone-600">
                  Medium
                </SelectItem>
                <SelectItem value="hard" className="hover:bg-stone-600">
                  Hard
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boilerplate" className="text-gray-300">
              Boilerplate Code
            </Label>
            <Textarea
              id="boilerplate"
              name="boilerplate"
              placeholder="function solution() {\n  // code here\n}"
              rows={4}
              value={problem.boilerplate}
              onChange={handleChange}
              className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-700">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">Test Cases</Label>
              <Button
                type="button"
                variant="outline"
                onClick={addTestCase}
                className="border-stone-600 text-gray-300 hover:bg-stone-700 hover:text-white"
              >
                Add Test Case
              </Button>
            </div>

            {testCases.map((testCase, index) => (
              <div
                key={index}
                className="space-y-3 border border-stone-700 p-4 rounded-md relative bg-stone-700/30"
              >
                <div className="absolute top-2 right-2">
                  {testCases.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTestCase(index)}
                      className="bg-red-800 hover:bg-red-700 text-red-100"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-gray-200">
                  Test Case {index + 1}
                </h4>
                <div className="space-y-2">
                  <Label htmlFor={`input-${index}`} className="text-gray-400">
                    Input (JSON format)
                  </Label>
                  <Textarea
                    id={`input-${index}`}
                    placeholder='"[1, 2, 3]" or "10"'
                    value={testCase.input}
                    onChange={(e) =>
                      handleTestCaseChange(index, "input", e.target.value)
                    }
                    className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`output-${index}`} className="text-gray-400">
                    Expected Output (JSON format)
                  </Label>
                  <Textarea
                    id={`output-${index}`}
                    placeholder='"[2, 4, 6]" or "20"'
                    value={testCase.output}
                    onChange={(e) =>
                      handleTestCaseChange(index, "output", e.target.value)
                    }
                    className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-stone-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-stone-600 text-gray-300 hover:bg-stone-700 hover:text-white"
          >
            Cancel
          </Button>
          {/* <Button
            type="button"
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={!validateForm()}
          >
            Add Problem
          </Button> */}
        </DialogFooter>
      </DarkDialogContent>
    </Dialog>
  );
}
