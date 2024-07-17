"use client";
import React, { createContext, useReducer, useEffect } from "react";

type Action = { type: "LOGIN"; payload: any } | { type: "LOGOUT" };
type Dispatch = (action: Action) => void;
type State = { user: any };

export const AuthContext = createContext<{
  user: string;
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
