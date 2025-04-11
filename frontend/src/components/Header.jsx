import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <header
      className={`p-4 flex justify-between items-center ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-blue-600 text-white"
      }`}
    >
      <h1 className="text-2xl font-bold">Pig Weight Estimator</h1>
      <ThemeToggle />
    </header>
  );
};

export default Header;
