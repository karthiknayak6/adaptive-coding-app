"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import UserEditForm from "./UserEditForm";
import PerformanceAnalysis from "./PerformanceAnalysis";
import axios from "axios";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

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

type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
  totalProblems: number;
  rank: number | null;
  profilePicture?: string;
};

type ProblemStat = {
  id: string;
  user_id: string;
  problem_id: number;
  solved_at: string;
  time_taken: number;
  runtime: number;
  difficulty_level: string;
};

type Problem = {
  id: number;
  title: string;
  difficulty: string;
};

export default function UserProfile() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [problemStats, setProblemStats] = useState<ProblemStat[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const backendUrl = "http://localhost:8080";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get token from local storage
        let token = localStorage.getItem("user");
        if (token) {
          token = JSON.parse(token);
        }

        // Fetch user profile data
        const response = await axios.get(`${backendUrl}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(
          "Full profile response data:",
          JSON.stringify(response.data, null, 2)
        );

        if (response.data.user) {
          setUser(response.data.user);
          console.log("User data:", response.data.user);
        } else {
          console.error("No user data found in the response");
        }

        // Get solved problems from the profile response
        if (
          response.data.solved_problems &&
          response.data.solved_problems.length > 0
        ) {
          setProblemStats(response.data.solved_problems);
          console.log("Solved problems:", response.data.solved_problems);
        } else {
          console.warn(
            "No solved problems found in the response or empty array"
          );
          console.log("solved_problems:", response.data.solved_problems);
        }

        // Fetch problem details for reference
        try {
          const problemsResponse = await axios.get(
            `${backendUrl}/admin/problems`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Problems response:", problemsResponse.data);

          if (problemsResponse.status === 200) {
            setProblems(problemsResponse.data);
          }
        } catch (error) {
          console.error("Error fetching problems:", error);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  // Get initials for avatar fallback
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  };

  // Calculate user's join date
  const getJoinDate = () => {
    if (!user?.createdAt) return "Unknown";
    const date = new Date(user.createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle form submission success
  const handleUpdateSuccess = (updatedUser: any) => {
    // Map the returned user properties to match our User type
    if (user) {
      setUser({
        ...user,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      });
    }
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  // Find problem by ID in problems array
  const findProblemById = (problemId: number) => {
    return problems.find((p) => p.id === problemId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-gray-300 bg-stone-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-gray-300 bg-stone-900">
        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-gray-400">
          Unable to load profile information. Please log in or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-gray-100">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Tabs defaultValue="overview" className="w-full bg-stone-900">
          <TabsList className="mb-6 bg-stone-900 text-gray-300">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-white"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <Card className="bg-stone-800 border-stone-700 text-white">
                  <CardHeader className="pb-0">
                    <div className="flex flex-col items-center">
                      <div className="h-24 w-24 mb-4 rounded-full overflow-hidden bg-stone-700 flex items-center justify-center text-gray-300">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-semibold">
                            {getInitials(user.firstName, user.lastName)}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-2xl font-bold text-center text-white">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <CardDescription className="text-center text-lg font-medium text-gray-300">
                        @{user.username}
                      </CardDescription>
                      {user.rank && (
                        <Badge className="mt-2 bg-stone-700 text-gray-200 hover:bg-stone-600">
                          Rank #{user.rank}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-gray-300 text-sm">
                            Problems Solved
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {user.totalProblems || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">Joined</p>
                          <p className="text-sm font-medium text-white">
                            {getJoinDate()}
                          </p>
                        </div>
                      </div>

                      <div className="h-px w-full bg-stone-700 my-4"></div>

                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-300">
                          Contact Information
                        </h3>
                        <p className="text-sm break-words text-white">
                          {user.email}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-stone-600 text-gray-300 hover:bg-stone-700 hover:text-white"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:w-2/3">
                <Card className="h-full bg-stone-800 border-stone-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Your recent problem-solving activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {problemStats.length > 0 ? (
                      <div className="space-y-4">
                        <div className="rounded-md border border-stone-700">
                          <table className="min-w-full divide-y divide-stone-700">
                            <thead>
                              <tr className="bg-stone-700/50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                  Problem
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                  Difficulty
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                  Time Taken
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                  Solved At
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-700 bg-stone-800">
                              {problemStats.slice(0, 5).map((stat) => {
                                const problem = findProblemById(
                                  stat.problem_id
                                );

                                const formatTime = (milliseconds: number) => {
                                  if (milliseconds < 1000)
                                    return `${milliseconds}ms`;
                                  if (milliseconds < 60000)
                                    return `${(milliseconds / 1000).toFixed(
                                      1
                                    )}s`;
                                  const minutes = Math.floor(
                                    milliseconds / 60000
                                  );
                                  const seconds = Math.floor(
                                    (milliseconds % 60000) / 1000
                                  );
                                  return `${minutes}m ${seconds}s`;
                                };

                                const formatDate = (dateString: string) => {
                                  const date = new Date(dateString);
                                  return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  });
                                };

                                const getDifficultyBadge = (
                                  difficulty: string
                                ) => {
                                  const level = difficulty.toLowerCase();
                                  if (level === "easy")
                                    return "bg-green-900 text-green-200 border border-green-700";
                                  if (level === "medium")
                                    return "bg-yellow-900 text-yellow-200 border border-yellow-700";
                                  if (level === "hard")
                                    return "bg-red-900 text-red-200 border border-red-700";
                                  return "bg-gray-700 text-gray-200 border border-gray-600";
                                };

                                return (
                                  <tr
                                    key={stat.id}
                                    className="hover:bg-stone-700/40"
                                  >
                                    <td className="px-4 py-3 text-sm text-white">
                                      {problem?.title || "Unknown Problem"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <Badge
                                        variant="outline"
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(
                                          stat.difficulty_level
                                        )}`}
                                      >
                                        {stat.difficulty_level}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">
                                      {formatTime(stat.time_taken)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                      {formatDate(stat.solved_at)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {problemStats.length > 5 && (
                          <div className="text-center">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-orange-400 hover:text-orange-300"
                            >
                              View all {problemStats.length} solved problems
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-300 mb-4">
                          You haven't solved any problems yet.
                        </p>
                        <Button
                          variant="outline"
                          className="border-stone-600 text-gray-300 hover:bg-stone-700 hover:text-white"
                        >
                          Start Solving
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceAnalysis
              problemDetails={problemStats}
              problems={problems}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-stone-800 border-stone-700 text-white">
              <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Update your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserEditForm user={user} onSuccess={handleUpdateSuccess} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DarkDialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Profile</DialogTitle>
              <DialogDescription className="text-gray-300">
                Update your personal information
              </DialogDescription>
            </DialogHeader>
            <UserEditForm
              user={user}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setIsEditing(false)}
            />
          </DarkDialogContent>
        </Dialog>
      </div>
    </div>
  );
}
