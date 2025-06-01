"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddProblemModal from "./AddProblemModal";
import axios from "axios";

type Problem = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  boilerplate: string;
  test_cases: TestCase[];
};

type TestCase = {
  test_case_id: number;
  input: any;
  output: any;
};

export default function ProblemManagement() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const backendUrl = "http://localhost:8080";

  // Fetch all problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        let token = localStorage.getItem("user");
        if (token) {
          token = JSON.parse(token);
        }
        const response = await axios.get(`${backendUrl}/admin/problems`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProblems(response.data);
      } catch (err) {
        setError("Error fetching problems. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Delete problem
  const handleDeleteProblem = async (problemId: number) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) {
      return;
    }

    try {
      setLoading(true);
      let token = localStorage.getItem("user");
      if (token) {
        token = JSON.parse(token);
      }
      await axios.delete(`${backendUrl}/admin/problems/${problemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove problem from the list
      setProblems(problems.filter((problem) => problem.id !== problemId));
    } catch (err) {
      setError("Error deleting problem. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new problem
  const handleAddProblem = async (newProblem: Omit<Problem, "id">) => {
    try {
      setLoading(true);
      let token = localStorage.getItem("user");
      if (token) {
        token = JSON.parse(token);
      }
      const response = await axios.post(
        `${backendUrl}/admin/problems`,
        newProblem,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProblems([...problems, response.data]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError("Error adding problem. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const level = difficulty.toLowerCase();
    if (level === "easy")
      return "bg-green-900 text-green-200 border border-green-700";
    if (level === "medium")
      return "bg-yellow-900 text-yellow-200 border border-yellow-700";
    if (level === "hard")
      return "bg-red-900 text-red-200 border border-red-700";
    return "bg-stone-700 text-gray-200 border border-stone-600";
  };

  if (loading && problems.length === 0) {
    return <div className="p-4 text-gray-300">Loading problems...</div>;
  }

  if (error && problems.length === 0) {
    return <div className="p-4 text-red-400">{error}</div>;
  }

  return (
    <div className="text-gray-100">
      <div className="flex justify-end mb-4">
        {/* 
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Add New Problem
        </Button>
        */}
      </div>

      <Card className="bg-stone-800 border-stone-700 text-white">
        <CardHeader>
          <CardTitle className="text-white">Problem Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-stone-700 hover:bg-stone-700/30">
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Title</TableHead>
                <TableHead className="text-gray-300">Difficulty</TableHead>
                <TableHead className="text-gray-300">Test Cases</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <TableRow
                  key={problem.id}
                  className="border-stone-700 hover:bg-stone-700/30"
                >
                  <TableCell className="text-gray-300">{problem.id}</TableCell>
                  <TableCell className="font-medium text-white">
                    {problem.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(problem.difficulty)}
                    >
                      {problem.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {problem.test_cases?.length || 0}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProblem(problem.id)}
                      className="bg-red-700 hover:bg-red-600 text-white"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProblem}
      />
    </div>
  );
}
