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
import Link from "next/link";
import UserDetailsModal from "./UserDetailsModal";
import axios from "axios";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  solved_problems: number[];
  created_at: string;
};

type UserDetails = {
  user: User;
  problem_details: ProblemDetail[];
};

type ProblemDetail = {
  id: string;
  problem_id: number;
  solved_at: string;
  time_taken: number;
  runtime: number;
  difficulty_level: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backendUrl = "http://localhost:8080";

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let token = localStorage.getItem("user");
        if (token) {
          token = JSON.parse(token);
        }
        console.log("token", token);
        const response = await axios.get(`${backendUrl}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Sort users by number of solved problems (highest first)
        const sortedUsers = response.data.sort((a: User, b: User) => {
          const aCount = a.solved_problems?.length || 0;
          const bCount = b.solved_problems?.length || 0;
          return bCount - aCount;
        });

        setUsers(sortedUsers);
      } catch (err) {
        setError("Error fetching users. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      let token = localStorage.getItem("user");
      if (token) {
        token = JSON.parse(token);
      }
      const response = await axios.get(`${backendUrl}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("response", response.data);

      setSelectedUser(response.data);
      setIsModalOpen(true);
    } catch (err) {
      setError("Error fetching user details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);
      let token = localStorage.getItem("user");
      if (token) {
        token = JSON.parse(token);
      }
      await axios.delete(`${backendUrl}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove user from the list
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Error deleting user. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return <div className="p-4 text-gray-300">Loading users...</div>;
  }

  if (error && users.length === 0) {
    return <div className="p-4 text-red-400">{error}</div>;
  }

  return (
    <div className="text-gray-100">
      <Card className="bg-stone-800 border-stone-700 text-white">
        <CardHeader>
          <CardTitle className="text-white">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-stone-700 hover:bg-stone-700/30">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Username</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Solved Problems</TableHead>
                <TableHead className="text-gray-300">Joined</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-stone-700 hover:bg-stone-700/30"
                >
                  <TableCell className="text-white">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {user.username}
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell className="text-gray-300">
                    {user.solved_problems?.length || 0}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchUserDetails(user.id)}
                        className="border-stone-600 text-gray-800 hover:bg-stone-400 hover:text-white"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-700 hover:bg-red-600 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
