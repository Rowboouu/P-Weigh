import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <header
      className={`py-4 px-8 flex justify-between items-center border-b ${
        theme === "dark" ? "text-white" : "bg-white text-[#0B0B0B]"
      }`}
    >
      <h1 className="text-2xl font-bold">P-Weigh</h1>
      <ThemeToggle />
    </header>
  );
};

export default Header;
