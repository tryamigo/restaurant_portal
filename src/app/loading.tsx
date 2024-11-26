// app/loading.tsx
'use client'
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function Loading() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center dark:bg-gray-800"
    >
      <div className="text-center">
        <Loader2 
          className="mx-auto mb-4 h-16 w-16 text animate-spin" 
        />
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 ">
          Loading... Please wait
        </p>
      </div>
    </motion.div>
  )
}