'use client'
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

const Loader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center dark:bg-gray-800"
    >
      <div className="text-center">
        <Loader2 className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 border-solid"
        />
      </div>
    </motion.div>
  )
}

export default Loader;