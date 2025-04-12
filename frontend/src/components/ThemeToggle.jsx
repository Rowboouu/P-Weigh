import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div
      onClick={toggleTheme}
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${
        theme === "light" ? "bg-gray-200" : "bg-gray-600"
      }`}
      aria-label="Toggle theme"
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
          theme === "light" ? "translate-x-0" : "translate-x-6"
        }`}
      ></div>
    </div>
  );
};

export default ThemeToggle;
