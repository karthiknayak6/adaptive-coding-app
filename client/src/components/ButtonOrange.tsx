import React from "react";
import clsx from "clsx";

interface ButtonOrangeProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ButtonOrange: React.FC<ButtonOrangeProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      className={clsx(
        " bg-orange-600 text-white text-lg font-medium rounded-full shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition ease-in-out duration-300",
        className
      )}
    >
      {children}
    </button>
  );
};

export default ButtonOrange;
