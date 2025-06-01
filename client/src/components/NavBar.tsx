"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserCircle, ShieldCheck, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, dispatch } = useAuth();
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-stone-900 shadow-md p-3 w-full border-b border-stone-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-orange-400 cursor-pointer"
          >
            CodeMastery
          </div>
          <div className="flex space-x-6 items-center">
            {!user && (
              <a
                href="/login"
                className="hover:text-orange-300 font-medium text-orange-100 text-lg"
              >
                Login
              </a>
            )}

            {user && (
              <>
                <a
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-800 text-gray-100 cursor-pointer transition-colors"
                >
                  <UserCircle className="h-5 w-5 text-orange-400" />
                  <span>Profile</span>
                </a>
                <a
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-800 text-gray-100 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="h-5 w-5 text-orange-400" />
                  <span>Admin</span>
                </a>
                <a
                  onClick={handleLogOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-800 text-red-400 cursor-pointer transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
