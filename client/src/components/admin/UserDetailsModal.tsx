"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  solved_problems: number[];
  created_at: string;
};

type ProblemDetail = {
  id: string;
  problem_id: number;
  solved_at: string;
  time_taken: number;
  runtime: number;
  difficulty_level: string;
};

type UserDetails = {
  user: User;
  problem_details: ProblemDetail[];
};

interface UserDetailsModalProps {
  user: UserDetails;
  isOpen: boolean;
  onClose: () => void;
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

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const convertNsToMs = (nanoseconds: number) => {
    return nanoseconds / 1000000;
  };

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) {
      return "bg-stone-700 text-gray-200 border border-stone-600"; // Default color for undefined/null
    }

    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-900 text-green-200 border border-green-700";
      case "medium":
        return "bg-yellow-900 text-yellow-200 border border-yellow-700";
      case "hard":
        return "bg-red-900 text-red-200 border border-red-700";
      default:
        return "bg-stone-700 text-gray-200 border border-stone-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DarkDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">User Details</DialogTitle>
          <DialogDescription className="text-gray-300">
            User information and solved problems
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-stone-800 border-stone-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-300">Name</p>
                  <p className="text-white">
                    {user.user.first_name} {user.user.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Username</p>
                  <p className="text-white">{user.user.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Email</p>
                  <p className="text-white">{user.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Joined</p>
                  <p className="text-white">
                    {new Date(user.user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Solved Problems
                  </p>
                  <p className="text-white">
                    {user.user.solved_problems?.length || 0} problems
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-800 border-stone-700">
            <CardHeader>
              <CardTitle className="text-white">
                Problem Solving History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.problem_details.length === 0 ? (
                <p className="text-gray-300">No problems solved yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-stone-700 hover:bg-stone-700/30">
                      <TableHead className="text-gray-300">
                        Problem ID
                      </TableHead>
                      <TableHead className="text-gray-300">
                        Difficulty
                      </TableHead>
                      <TableHead className="text-gray-300">
                        Time Taken
                      </TableHead>
                      <TableHead className="text-gray-300">Runtime</TableHead>
                      <TableHead className="text-gray-300">Solved At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.problem_details.map((problem) => (
                      <TableRow
                        key={problem.id}
                        className="border-stone-700 hover:bg-stone-700/30"
                      >
                        <TableCell className="text-white">
                          {problem.problem_id}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getDifficultyColor(
                              problem.difficulty_level
                            )}
                          >
                            {problem.difficulty_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {formatTime(problem.time_taken)}
                        </TableCell>
                        <TableCell className="text-white">
                          {convertNsToMs(problem.runtime).toFixed(2)}ms
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(problem.solved_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DarkDialogContent>
    </Dialog>
  );
}
