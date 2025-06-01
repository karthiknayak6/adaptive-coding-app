"use client";
import React, { createContext, useReducer, useEffect } from "react";

type User = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  solved_problems: number[];
  token: string;
} | null;

type Action = { type: "LOGIN"; payload: User } | { type: "LOGOUT" };
type Dispatch = (action: Action) => void;
type State = { user: User };

export const AuthContext = createContext<{
  user: User;
  dispatch: Dispatch;
} | null>(null);

export const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  useEffect(() => {
    const usr = localStorage.getItem("user");
    let user = null;
    if (usr) {
      user = JSON.parse(usr);
    }

    if (user) {
      dispatch({ type: "LOGIN", payload: user });
    }
  }, []);

  console.log("AuthContext state:", state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
