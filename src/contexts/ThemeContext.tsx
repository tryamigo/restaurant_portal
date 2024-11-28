import React, { createContext, useContext, useState, useEffect } from "react";
import Loader from "../components/Loader";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Retrieve theme from localStorage or default to "light"
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "light";

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (loading) return;

    setLoading(true);

    const newTheme = theme === "light" ? "dark" : "light";

    // Update the class on the root element
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update the state and localStorage
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {loading ? <Loader /> : children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
