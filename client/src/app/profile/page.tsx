"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserEditForm from "@/components/profile/UserEditForm";
import PerformanceChart from "@/components/profile/PerformanceChart";

type Problem = {
  id: number;
  title: string;
  difficulty: string;
};

type ProblemDetail = {
  id: string;
  problem_id: number;
  solved_at: string;
  time_taken: number;
  runtime: number;
  difficulty_level: string;
};

type User = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  solved_problems: number[];
  created_at: string;
};

type ProfileData = {
  user: User;
  solved_problems: ProblemDetail[];
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<Map<number, Problem>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const backendUrl = "http://localhost:8080";

  useEffect(() => {
    console.log("user", user);
    // Redirect if not logged in
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        console.log("usermmm", user);
        const response = await axios.get(`${backendUrl}/api/profile`, {
          headers: {
            Authorization: `Bearer ${user}`,
          },
        });
        setProfileData(response.data);

        // Fetch problems to get their titles
        if (response.data.user.solved_problems?.length > 0) {
          const problemsResponse = await axios.get(
            `${backendUrl}/admin/problems`,
            {
              headers: {
                Authorization: `Bearer ${user}`,
              },
            }
          );

          const problemsMap = new Map<number, Problem>();
          problemsResponse.data.forEach((problem: Problem) => {
            problemsMap.set(problem.id, problem);
          });

          setProblems(problemsMap);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, router]);

  const formatTime = (timeInMs: number) => {
    const seconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const calculateRank = (timeTaken: number, difficulty: string) => {
    // Simple ranking algorithm based on time and difficulty
    // In a real app, you would compare with other users' times
    let baseRank = "";

    switch (difficulty.toLowerCase()) {
      case "easy":
        if (timeTaken < 60000) baseRank = "S";
        else if (timeTaken < 180000) baseRank = "A";
        else if (timeTaken < 300000) baseRank = "B";
        else baseRank = "C";
        break;
      case "medium":
        if (timeTaken < 120000) baseRank = "S";
        else if (timeTaken < 240000) baseRank = "A";
        else if (timeTaken < 420000) baseRank = "B";
        else baseRank = "C";
        break;
      case "hard":
        if (timeTaken < 300000) baseRank = "S";
        else if (timeTaken < 600000) baseRank = "A";
        else if (timeTaken < 900000) baseRank = "B";
        else baseRank = "C";
        break;
      default:
        baseRank = "B";
    }

    return baseRank;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "S":
        return "bg-purple-100 text-purple-800";
      case "A":
        return "bg-blue-100 text-blue-800";
      case "B":
        return "bg-green-100 text-green-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <p className="text-xl">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-red-500">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <p className="text-xl">No profile data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Information Card */}
            <Card className="md:col-span-1 bg-stone-800 text-white">
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription className="text-gray-300">
                  Your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-300">Name</h3>
                    <p>
                      {profileData.user.first_name} {profileData.user.last_name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-300">
                      Username
                    </h3>
                    <p>{profileData.user.username}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-300">Email</h3>
                    <p>{profileData.user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-300">
                      Joined
                    </h3>
                    <p>
                      {new Date(
                        profileData.user.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-300">
                      Problems Solved
                    </h3>
                    <p>{profileData.user.solved_problems?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problems Solved Table */}
            <Card className="md:col-span-2 bg-stone-800 text-white">
              <CardHeader>
                <CardTitle>Problems Solved</CardTitle>
                <CardDescription className="text-gray-300">
                  Your solved problems with performance details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileData.solved_problems &&
                profileData.solved_problems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Problem</TableHead>
                        <TableHead className="text-gray-300">
                          Difficulty
                        </TableHead>
                        <TableHead className="text-gray-300">
                          Solved On
                        </TableHead>
                        <TableHead className="text-gray-300">
                          Time Taken
                        </TableHead>
                        <TableHead className="text-gray-300">Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profileData.solved_problems.map((problem) => {
                        const problemName =
                          problems.get(problem.problem_id)?.title ||
                          `Problem ${problem.problem_id}`;
                        const difficulty = problem.difficulty_level;
                        const rank = calculateRank(
                          problem.time_taken,
                          difficulty
                        );

                        return (
                          <TableRow key={problem.id}>
                            <TableCell className="font-medium">
                              {problemName}
                            </TableCell>
                            <TableCell>
                              <Badge className={getDifficultyColor(difficulty)}>
                                {difficulty}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(problem.solved_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {formatTime(problem.time_taken)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getRankColor(rank)}>
                                {rank}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p>You haven't solved any problems yet.</p>
                    <Button
                      onClick={() => router.push("/problems/1")}
                      className="mt-2"
                    >
                      Start Solving
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-stone-800 text-white">
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription className="text-gray-300">
                Your problem-solving performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileData.solved_problems &&
              profileData.solved_problems.length > 0 ? (
                <PerformanceChart
                  problemDetails={profileData.solved_problems}
                />
              ) : (
                <div className="text-center py-4">
                  <p>
                    No performance data available yet. Solve some problems to
                    see your progress!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card className="bg-stone-800 text-white">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription className="text-gray-300">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserEditForm
                user={{
                  id: profileData.user.id,
                  firstName: profileData.user.first_name,
                  lastName: profileData.user.last_name,
                  username: profileData.user.username,
                  email: profileData.user.email,
                }}
                onSuccess={(updatedUser) => {
                  // Handle success - would need to adapt properties back
                  console.log("Profile updated:", updatedUser);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
