import React, { createContext, useContext, useState, useEffect } from "react";
import Loader from "../components/Loader";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light"); // Set initial state to "light"
  const [loading, setLoading] = useState(true); // State to manage the loading state

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = storedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.classList.add(initialTheme);

    // After setting the theme, stop the loading state
    setLoading(false);
  }, []);

  const toggleTheme = () => {
    if (loading) return; // Avoid toggling when in loading state

    setLoading(true); // Set loading to true while theme is being toggled

    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);

    // Stop the loader after theme switch
    setTimeout(() => {
      setLoading(false); // Stop loading after the transition
    }, 500); // You can adjust the time based on how long you want the loader to show
  };

  if (loading) {
    return <Loader />; // Show the loader until theme is set
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
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
