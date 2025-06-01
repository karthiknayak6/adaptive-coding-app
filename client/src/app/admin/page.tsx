"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/admin/UserManagement";
import ProblemManagement from "@/components/admin/ProblemManagement";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  // In a real application, you would check if the user has admin role
  // For this implementation, we'll just redirect if not logged in
  useEffect(() => {
    // Give a small delay to ensure authentication state is loaded
    const timer = setTimeout(() => {
      setLoading(false);
      if (!user) {
        router.push("/login");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-white">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center min-h-[300px] text-gray-300">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="container mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-300">Manage users and problems</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-stone-900 text-gray-300">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-white"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="problems"
              className="data-[state=active]:bg-stone-800 data-[state=active]:text-white"
            >
              Problems
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="problems">
            <ProblemManagement />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Link
            href="/"
            className="text-orange-400 hover:text-orange-300 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
