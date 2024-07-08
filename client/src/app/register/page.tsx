"use client";
import * as z from "zod";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";

const registerSchema = z
  .object({
    f_name: z.string().min(2, "First name must be at least 2 characters"),
    l_name: z.string().min(2, "Last name must be at least 2 characters"),
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
      await axios.post('/api/register', data);
      setIsRegistered(true);
      reset();
    } catch (error) {
      // Handle the error, possibly using setError to show form errors
      console.error(error);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-lg shadow-md mt-8 mb-20">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Register
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="f_name"
                className="block text-sm font-medium text-gray-700"
              >
                First name:
              </label>
              <input
                {...register("f_name")}
                id="f_name"
                name="f_name"
                type="text"
                autoComplete="f_name"
                required
                className="mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.f_name && (
                <p className="text-red-500">{errors.f_name.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="l_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last name:
              </label>
              <input
                {...register("l_name")}
                id="l_name"
                name="l_name"
                type="text"
                autoComplete="l_name"
                required
                className="mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.l_name && (
                <p className="text-red-500">{errors.l_name.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email:
              </label>
              <input
                {...register("email")}
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                {...register("username")}
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-indigo-500"
              />
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                {...register("password")}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-purple-500"
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 p-3 block w-full border rounded-md focus:outline-none focus:border-purple-500"
              />
              {errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
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
              <a className="text-blue-700 hover:text-blue-500" href="/login">
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
