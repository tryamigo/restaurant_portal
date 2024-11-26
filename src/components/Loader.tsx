import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center dark:bg-gray-800 z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 border-solid shadow-lg"></div>
    </div>
  );
};

export default Loader;
