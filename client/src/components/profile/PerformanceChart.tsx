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
  problem_id: number; // Expects number from the profile page
  solved_at: string;
  time_taken: number;
  runtime: number;
  difficulty_level: string;
};

interface PerformanceChartProps {
  problemDetails: ProblemDetail[];
}

// Define the type for the calculated statistics
interface PerformanceStats {
  totalSolved: number;
  averageTime: number;
  fastestSolve: {
    time: number;
    problemId: number;
  };
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalTime: number;
  recentTrend: "improving" | "slowing" | "neutral";
}

export default function PerformanceChart({
  problemDetails,
}: PerformanceChartProps) {
  // Calculate statistics
  const stats = useMemo<PerformanceStats>(() => {
    if (!problemDetails.length) {
      return {
        totalSolved: 0,
        averageTime: 0,
        fastestSolve: { time: 0, problemId: 0 },
        byDifficulty: { easy: 0, medium: 0, hard: 0 },
        totalTime: 0,
        recentTrend: "neutral",
      };
    }

    const sorted = [...problemDetails].sort(
      (a, b) =>
        new Date(a.solved_at).getTime() - new Date(b.solved_at).getTime()
    );

    const totalTime = problemDetails.reduce(
      (sum, detail) => sum + detail.time_taken,
      0
    );

    const byDifficulty = problemDetails.reduce(
      (acc, detail) => {
        const difficulty = detail.difficulty_level.toLowerCase();
        if (difficulty === "easy") acc.easy += 1;
        else if (difficulty === "medium") acc.medium += 1;
        else if (difficulty === "hard") acc.hard += 1;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );

    let fastestSolve = { time: Infinity, problemId: 0 };

    // Find the fastest solve without using reduce to avoid type issues
    for (const detail of problemDetails) {
      if (detail.time_taken < fastestSolve.time) {
        fastestSolve = {
          time: detail.time_taken,
          problemId: detail.problem_id,
        };
      }
    }

    // Calculate recent trend (improving or not)
    let recentTrend: "improving" | "slowing" | "neutral" = "neutral";
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
      totalSolved: problemDetails.length,
      averageTime: totalTime / problemDetails.length,
      fastestSolve,
      byDifficulty,
      totalTime,
      recentTrend,
    };
  }, [problemDetails]);

  // Format time (ms) to human readable format
  const formatTime = (milliseconds: number) => {
    if (!isFinite(milliseconds)) return "N/A";

    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  };

  // Get trend message and color
  const getTrendInfo = () => {
    switch (stats.recentTrend) {
      case "improving":
        return {
          message: "Improving! Your recent solves are faster.",
          color: "text-green-600",
        };
      case "slowing":
        return {
          message: "Slowing down. Take your time to understand the problems.",
          color: "text-amber-600",
        };
      default:
        return {
          message: "Consistent performance in recent solves.",
          color: "text-blue-600",
        };
    }
  };

  const trendInfo = getTrendInfo();

  // Generate time series data for chart
  const timeSeriesData = useMemo(() => {
    return [...problemDetails]
      .sort(
        (a, b) =>
          new Date(a.solved_at).getTime() - new Date(b.solved_at).getTime()
      )
      .map((detail, index) => ({
        index: index + 1,
        timeTaken: detail.time_taken,
        date: new Date(detail.solved_at).toLocaleDateString(),
        difficulty: detail.difficulty_level,
      }));
  }, [problemDetails]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Problems Solved</CardTitle>
            <CardDescription>Total problems completed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalSolved}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-50">
                Easy: {stats.byDifficulty.easy}
              </Badge>
              <Badge variant="outline" className="bg-yellow-50">
                Medium: {stats.byDifficulty.medium}
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                Hard: {stats.byDifficulty.hard}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Time</CardTitle>
            <CardDescription>Time spent per problem</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatTime(stats.averageTime)}
            </p>
            <p className="text-sm mt-2">
              Total time spent coding: {formatTime(stats.totalTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Fastest Solve</CardTitle>
            <CardDescription>Your quickest problem solution</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatTime(stats.fastestSolve.time)}
            </p>
            <p
              className="text-sm mt-2 truncate"
              title={`Problem ID: ${stats.fastestSolve.problemId}`}
            >
              Problem ID: {stats.fastestSolve.problemId}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>
            Your problem-solving times over the last {stats.totalSolved}{" "}
            problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className={`text-lg font-medium ${trendInfo.color}`}>
              {trendInfo.message}
            </p>

            {problemDetails.length > 0 ? (
              <div>
                {/* Simple visual representation of solving times */}
                <div className="relative h-60 mt-4">
                  {timeSeriesData.length > 1 && (
                    <>
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-500">
                        <span>Fast</span>
                        <span>Avg</span>
                        <span>Slow</span>
                      </div>

                      {/* Time series visualization */}
                      <div className="absolute left-10 right-0 top-0 bottom-0">
                        {/* Time series lines */}
                        <svg
                          className="w-full h-full"
                          viewBox={`0 0 ${timeSeriesData.length * 20} 100`}
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id="gradient"
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="rgb(34, 197, 94)"
                                stopOpacity="0.2"
                              />
                              <stop
                                offset="100%"
                                stopColor="rgb(34, 197, 94)"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>

                          {/* Area under the curve */}
                          <path
                            d={`
                              M 0 ${Math.min(
                                100,
                                (timeSeriesData[0].timeTaken /
                                  stats.averageTime) *
                                  50
                              )}
                              ${timeSeriesData
                                .map(
                                  (data, i) =>
                                    ` L ${i * 20} ${Math.min(
                                      100,
                                      (data.timeTaken / stats.averageTime) * 50
                                    )}`
                                )
                                .join("")}
                              L ${
                                (timeSeriesData.length - 1) * 20
                              } 100 L 0 100 Z
                            `}
                            fill="url(#gradient)"
                          />

                          {/* Line connecting data points */}
                          <path
                            d={`
                              M 0 ${Math.min(
                                100,
                                (timeSeriesData[0].timeTaken /
                                  stats.averageTime) *
                                  50
                              )}
                              ${timeSeriesData
                                .map(
                                  (data, i) =>
                                    ` L ${i * 20} ${Math.min(
                                      100,
                                      (data.timeTaken / stats.averageTime) * 50
                                    )}`
                                )
                                .join("")}
                            `}
                            fill="none"
                            stroke="rgb(34, 197, 94)"
                            strokeWidth="2"
                          />

                          {/* Data points */}
                          {timeSeriesData.map((data, i) => (
                            <circle
                              key={i}
                              cx={i * 20}
                              cy={Math.min(
                                100,
                                (data.timeTaken / stats.averageTime) * 50
                              )}
                              r="3"
                              fill={
                                data.difficulty.toLowerCase() === "easy"
                                  ? "rgb(34, 197, 94)"
                                  : data.difficulty.toLowerCase() === "medium"
                                  ? "rgb(234, 179, 8)"
                                  : "rgb(239, 68, 68)"
                              }
                            />
                          ))}
                        </svg>

                        {/* X-axis labels - show only first, middle and last for clarity */}
                        {timeSeriesData.length > 2 && (
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>{timeSeriesData[0].date}</span>
                            <span>
                              {
                                timeSeriesData[
                                  Math.floor(timeSeriesData.length / 2)
                                ].date
                              }
                            </span>
                            <span>
                              {timeSeriesData[timeSeriesData.length - 1].date}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Difficulty distribution */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">
                    Problem Difficulty Distribution
                  </h4>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{
                        width: `${
                          (stats.byDifficulty.easy / stats.totalSolved) * 100
                        }%`,
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                    <div
                      style={{
                        width: `${
                          (stats.byDifficulty.medium / stats.totalSolved) * 100
                        }%`,
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                    ></div>
                    <div
                      style={{
                        width: `${
                          (stats.byDifficulty.hard / stats.totalSolved) * 100
                        }%`,
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Solve more problems to see your performance trends!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
