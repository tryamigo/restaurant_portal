import React from "react";
import { motion } from "framer-motion";

interface HoverTooltipProps {
  description: string;
  position: { x: number; y: number } | null;
}

const HoverTooltip: React.FC<HoverTooltipProps> = ({ description, position }) => {
  if (!position) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute z-50 bg-white p-2 shadow-md rounded-md text-sm dark:bg-gray-800 dark:text-gray-300"
      style={{ top: position.y + 10, left: position.x + 10 }}
    >
      {description}
    </motion.div>
  );
};

export default HoverTooltip;
