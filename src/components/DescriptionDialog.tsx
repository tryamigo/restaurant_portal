"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Utensils} from 'lucide-react';
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { MenuItem } from "@/components/types";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

const ItemDialog: React.FC<ItemDialogProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-2xl mx-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden shadow-lg max-h-[90vh] flex flex-col">
              <div className="relative h-72 md:h-96 flex-shrink-0">
                <Image
                  src={
                    item.imageLink || "/placeholder.svg?height=384&width=768"
                  }
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-4 bg-white/80 hover:bg-white/90 rounded-full p-2"
                  onClick={handleClose}
                >
                  <X className="h-6 w-6 text-gray-800" />
                  <span className="sr-only">Close</span>
                </motion.button>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {item.name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="flex items-center space-x-1"
                      initial="rest"
                      whileHover="hover"
                    >
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          variants={{
                            rest: { scale: 1 },
                            hover: { scale: 1.2 },
                          }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              i < Math.floor(item.ratings ?? 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                    <span className="text-sm text-white/90">
                      ({item.ratings})
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 overflow-y-auto overflow-x-hidden">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-3xl font-bold">₹{Number(item.price).toFixed(2)}</h2>
                {item.discounts && (
                  <Badge variant="destructive" className="text-xs">
                    {item.discounts} %
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground ">
                <Utensils className="h-4 w-4" />
                <span>{item.cuisine || 'Various Cuisines'}</span>
                <span>•</span>
                <span>{item.vegOrNonVeg}</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t break-words ">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        </div>
      </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemDialog;

