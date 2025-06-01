"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormFieldContext,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import axios from "axios";

// Define the user type
type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture?: string;
  [key: string]: any;
};

// Define the form schema type
type FormValues = z.infer<typeof formSchema>;

// Define props for the component
interface UserEditFormProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
  onCancel?: () => void;
}

// Define form validation schema
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Invalid email address"),
  profilePicture: z.string().optional(),
});

export default function UserEditForm({
  user,
  onSuccess,
  onCancel,
}: UserEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const backendUrl = "http://localhost:8080";

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
      profilePicture: user.profilePicture || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Get token from local storage
      let token = localStorage.getItem("user");
      if (token) {
        token = JSON.parse(token);
      }

      // Make API call to update user profile
      const response = await axios.put(
        `${backendUrl}/api/profile/update`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Call the success callback with updated user data
      onSuccess(response.data);
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMessage = "Failed to update profile. Please try again.";

      // Extract error message if available
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "firstName">;
            }) => (
              <FormItem>
                <FormLabel className="text-gray-300">First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    {...field}
                    className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({
              field,
            }: {
              field: ControllerRenderProps<FormValues, "lastName">;
            }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    {...field}
                    className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "username">;
          }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="johndoe123"
                  {...field}
                  className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "email">;
          }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  {...field}
                  className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profilePicture"
          render={({
            field,
          }: {
            field: ControllerRenderProps<FormValues, "profilePicture">;
          }) => (
            <FormItem>
              <FormLabel className="text-gray-300">
                Profile Picture URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/profile.jpg"
                  {...field}
                  className="bg-stone-700 border-stone-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-stone-600 text-gray-300 hover:bg-stone-700 hover:text-white"
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
