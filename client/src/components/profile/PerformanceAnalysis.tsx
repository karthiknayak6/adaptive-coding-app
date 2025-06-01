"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ProblemDetail = {
  id: string;
  problem_id: number;
  user_id: string;
  solved_at: string;
  time_taken: number;
  runtime: number;
  difficulty_level: string;
  title?: string;
};

interface PerformanceAnalysisProps {
  problemDetails: ProblemDetail[];
  problems: {
    id: number;
    title: string;
    difficulty: string;
  }[];
}

export default function PerformanceAnalysis({
  problemDetails,
  problems,
}: PerformanceAnalysisProps) {
  // Enrich problem details with problem titles
  const enrichedProblemDetails = useMemo(() => {
    return problemDetails.map((detail) => {
      const problem = problems.find((p) => p.id === detail.problem_id);
      return {
        ...detail,
        title: problem?.title || "Unknown Problem",
      };
    });
  }, [problemDetails, problems]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!enrichedProblemDetails.length) {
      return {
        totalSolved: 0,
        averageTime: 0,
        fastestSolve: { time: 0, problem: "None" },
        byDifficulty: { easy: 0, medium: 0, hard: 0 },
        totalTime: 0,
        recentTrend: "neutral",
      };
    }

    const sorted = [...enrichedProblemDetails].sort(
      (a, b) =>
        new Date(a.solved_at).getTime() - new Date(b.solved_at).getTime()
    );

    const totalTime = enrichedProblemDetails.reduce(
      (sum, detail) => sum + detail.time_taken,
      0
    );
    const byDifficulty = enrichedProblemDetails.reduce(
      (acc, detail) => {
        const difficulty = detail.difficulty_level.toLowerCase();
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 } as Record<string, number>
    );

    const fastestSolve = enrichedProblemDetails.reduce(
      (fastest, detail) => {
        return detail.time_taken < fastest.time
          ? { time: detail.time_taken, problem: detail.title || "Unknown" }
          : fastest;
      },
      { time: Infinity, problem: "None" }
    );

    // Calculate recent trend (improving or not)
    let recentTrend = "neutral";
    if (sorted.length >= 5) {
      const recentFive = sorted.slice(-5);
      const olderFive = sorted.slice(-10, -5);

      if (recentFive.length && olderFive.length) {
        const recentAvg =
          recentFive.reduce((sum, p) => sum + p.time_taken, 0) /
          recentFive.length;
        const olderAvg =
          olderFive.reduce((sum, p) => sum + p.time_taken, 0) /
          olderFive.length;

        if (recentAvg < olderAvg * 0.9) {
          recentTrend = "improving";
        } else if (recentAvg > olderAvg * 1.1) {
          recentTrend = "slowing";
        }
      }
    }

    return {
      totalSolved: enrichedProblemDetails.length,
      averageTime: totalTime / enrichedProblemDetails.length,
      fastestSolve,
      byDifficulty,
      totalTime,
      recentTrend,
    };
  }, [enrichedProblemDetails]);

  // Format time (ms) to human readable format
  const formatTime = (milliseconds: number) => {
    if (!isFinite(milliseconds)) return "N/A"; // Handle potential NaN
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Get trend message and color
  const getTrendInfo = () => {
    switch (stats.recentTrend) {
      case "improving":
        return {
          message: "Improving! Your recent solves are faster.",
          color: "text-green-400", // Lighter green for dark mode
        };
      case "slowing":
        return {
          message: "Slowing down. Take your time to understand the problems.",
          color: "text-yellow-400", // Lighter yellow
        };
      default:
        return {
          message: "Consistent performance in recent solves.",
          color: "text-blue-400", // Lighter blue
        };
    }
  };

  const trendInfo = getTrendInfo();

  return (
    <div className="space-y-6 text-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-stone-800 border-stone-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">
              Problems Solved
            </CardTitle>
            <CardDescription className="text-gray-300">
              Total problems completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.totalSolved}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="bg-green-900 text-green-200 border border-green-700"
              >
                Easy: {stats.byDifficulty.easy || 0}
              </Badge>
              <Badge
                variant="outline"
                className="bg-yellow-900 text-yellow-200 border border-yellow-700"
              >
                Medium: {stats.byDifficulty.medium || 0}
              </Badge>
              <Badge
                variant="outline"
                className="bg-red-900 text-red-200 border border-red-700"
              >
                Hard: {stats.byDifficulty.hard || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-800 border-stone-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Average Time</CardTitle>
            <CardDescription className="text-gray-300">
              Time spent per problem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {formatTime(stats.averageTime)}
            </p>
            <p className="text-sm mt-2 text-gray-300">
              Total time spent coding: {formatTime(stats.totalTime)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-stone-800 border-stone-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Fastest Solve</CardTitle>
            <CardDescription className="text-gray-300">
              Your quickest problem solution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {formatTime(stats.fastestSolve.time)}
            </p>
            <p
              className="text-sm mt-2 truncate text-gray-300"
              title={stats.fastestSolve.problem}
            >
              Problem: {stats.fastestSolve.problem}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-stone-800 border-stone-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Trend</CardTitle>
          <CardDescription className="text-gray-300">
            Analysis of your recent problem-solving performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className={`text-lg font-medium ${trendInfo.color}`}>
              {trendInfo.message}
            </p>

            {enrichedProblemDetails.length > 0 ? (
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-stone-700">
                  <div
                    style={{
                      width: `${
                        ((stats.byDifficulty.easy || 0) / stats.totalSolved) *
                        100
                      }%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-700"
                  ></div>
                  <div
                    style={{
                      width: `${
                        ((stats.byDifficulty.medium || 0) / stats.totalSolved) *
                        100
                      }%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-600"
                  ></div>
                  <div
                    style={{
                      width: `${
                        ((stats.byDifficulty.hard || 0) / stats.totalSolved) *
                        100
                      }%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-700"
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Difficulty Distribution</span>
                  <span>{stats.totalSolved} Problems</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-300">
                Not enough data to show performance trends yet.
              </p>
            )}

            {/* Simple activity heatmap representation */}
            {enrichedProblemDetails.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-gray-300">
                  Recent Coding Activity
                </h4>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 30 }).map((_, i) => {
                    // Count problems solved on each of the last 30 days
                    const date = new Date();
                    date.setDate(date.getDate() - 29 + i);
                    date.setHours(0, 0, 0, 0);

                    const nextDate = new Date(date);
                    nextDate.setDate(nextDate.getDate() + 1);

                    const problemsOnDay = enrichedProblemDetails.filter(
                      (detail) => {
                        const solvedDate = new Date(detail.solved_at);
                        return solvedDate >= date && solvedDate < nextDate;
                      }
                    ).length;

                    // Darker heatmap colors
                    let bgColor = "bg-gray-700"; // Base for no activity
                    if (problemsOnDay > 0) {
                      if (problemsOnDay === 1) bgColor = "bg-green-800";
                      else if (problemsOnDay === 2) bgColor = "bg-green-600";
                      else if (problemsOnDay >= 3) bgColor = "bg-green-400";
                    }

                    return (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm ${bgColor}`}
                        title={`${date.toLocaleDateString()}: ${problemsOnDay} problems`}
                      ></div>
                    );
                  })}
                </div>
                <div className="flex mt-1 text-xs text-gray-500 justify-between">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
