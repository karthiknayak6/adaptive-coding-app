"use client";
import * as z from "zod";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";

const registerSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email(),
    username: z.string(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    try {
      // Replace with your registration logic, e.g., API call
      await axios.post("http://localhost:8080/register", data);
      setIsRegistered(true);
      reset();
    } catch (error) {
      // Handle the error, possibly using setError to show form errors
      console.error(error);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center container">
        <div className="max-w-md w-full p-8 space-y-8 bg-[#332f2f] rounded-lg shadow-md mt-8 mb-20 text-orange-100">
          <h2 className="text-3xl font-extrabold text-center text-orange-100">
            Register
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium">
                First name:
              </label>
              <input
                {...register("first_name")}
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="first_name"
                required
                className="text-black mt-1 p-2 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.first_name && (
                <p className="text-red-500">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium">
                Last name:
              </label>
              <input
                {...register("last_name")}
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="last_name"
                required
                className="text-black mt-1 p-2 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.last_name && (
                <p className="text-red-500">{errors.last_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email:
              </label>
              <input
                {...register("email")}
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="text-black mt-1 p-2 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="text-black mt-1 p-2 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
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
                className="text-black mt-1 p-2 block w-full border rounded-md focus:outline-none focus:border-orange-500"
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium"
              >
                Confirm password
              </label>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type="password"
                autoComplete="current-password"
                required
                className="text-black mt-1 p-2 block w-full border rounded-md focus:outline-none focus:border-orange-500"
              />
              {errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword.message}</p>
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

            {isRegistered && (
              <p className="text-white text-center bg-green-600 rounded-md py-1">
                Registered Successfully
              </p>
            )}

            <div className="text-center">
              Already have an account?{" "}
              <a className="text-blue-400 hover:text-blue-500" href="/login">
                Sign In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
