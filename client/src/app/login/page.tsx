"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { BallTriangle } from "react-loader-spinner";
import { useRouter } from "next/navigation";

// Define the schema using zod
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Your login logic here
      const response = await axios.post("http://localhost:8080/login", data);
      if (response.status === 200) {
        setIsLoggedIn(true);
        console.log("my token: ", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.token));
        reset();

        router.push("/");
        location.reload();
      }
    } catch (error) {
      console.error("Login error: ", error);
      setError("email", {
        type: "manual",
        message: "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed top-1/2 left-1/2">
        <BallTriangle
          height={100}
          width={100}
          radius={5}
          color="#9208c4"
          ariaLabel="ball-triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center container">
        <div className="max-w-md w-full p-8 space-y-8 bg-[#332f2f] text-orange-100 rounded-lg shadow-md">
          <h2 className="text-3xl font-extrabold text-center">Login</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                {...register("email")}
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="text-black mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                {...register("password")}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className=" text-black mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-orange-500"
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-700"
              >
                Sign in
              </button>
            </div>
            {isLoggedIn && (
              <p className="text-white text-center bg-green-600 rounded-md py-1">
                Logged in Successfully
              </p>
            )}
            <div className="text-center">
              Don't have an account?{" "}
              <a className="text-blue-400 hover:text-blue-500" href="/register">
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
