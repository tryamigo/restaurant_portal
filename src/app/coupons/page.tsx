// app/coupons/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

// UI Components
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Custom Components
import Header from "@/components/Header";
import { CouponList } from "@/components/CouponList";
import { CouponForm } from "@/components/CouponForm";

// Hooks and Utilities
import { initialObject } from "@/schema/CouponSchema";
import { useCouponOperations } from '@/hooks/useCouponOpearation';

const CouponsPage: React.FC = () => {
  // Authentication and Session
  const { data: session, status } = useSession();
  
  // State Management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddingCoupon, setIsAddingCoupon] = useState<boolean>(false);

  // Custom Hook for Coupon Operations
  const {
    coupons,
    filteredCoupons,
    isLoading,
    newCoupon,
    validationErrors,
    fetchCoupons,
    validateCoupon,
    handleAddCoupon,
    handleDeleteCoupon,
    handleUpdateCouponStatus,
    setNewCoupon,
    setValidationErrors,
    filterCoupons
  } = useCouponOperations();

  // Fetch Coupons on Authentication
  useEffect(() => {
    if (status === "authenticated") {
      fetchCoupons();
    }
  }, [session, status]);

  // Search Effect
  useEffect(() => {
    filterCoupons(searchTerm);
  }, [searchTerm, coupons]);

  // Coupon Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateCoupon();
    
    if (isValid) {
      await handleAddCoupon(session?.user?.id);
      setIsAddingCoupon(false);
    }
  };

  // Loading State
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* Header with Search and Add Coupon */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddItem={() => setIsAddingCoupon(true)}
      />
      
      {/* Main Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6 md:py-12 pt-[12rem]"
      >
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <CardContent className="mt-1">
            {filteredCoupons.length > 0 ? (
              <CouponList
                coupons={filteredCoupons}
                onDelete={handleDeleteCoupon}
                onStatusUpdate={handleUpdateCouponStatus}
              />
            ) : (
              <EmptyCouponState onAddCoupon={() => setIsAddingCoupon(true)} />
            )}
          </CardContent>
        </div>

        {/* Coupon Creation Dialog */}
        <CouponFormDialog
          isOpen={isAddingCoupon}
          onClose={() => {
            setIsAddingCoupon(false);
            setNewCoupon(initialObject);
            setValidationErrors({});
          }}
          onSubmit={handleSubmit}
          newCoupon={newCoupon}
          setNewCoupon={setNewCoupon}
          validationErrors={validationErrors}
        />
      </motion.div>
    </>
  );
};

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Empty Coupon State Component
interface EmptyCouponStateProps {
  onAddCoupon: () => void;
}

const EmptyCouponState: React.FC<EmptyCouponStateProps> = ({ onAddCoupon }) => (
  <div className="text-center py-12 bg-gray-50 rounded-xl">
    <Tag className="mx-auto h-12 md:h-16 w-12 md:w-16 text-gray-300 mb-4" />
    <p className="text-lg md:text-xl text-gray-500">No coupons available</p>
  </div>
);

// Coupon Form Dialog Component
interface CouponFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCoupon: any;
  setNewCoupon: React.Dispatch<React.SetStateAction<any>>;
  validationErrors: { [key: string]: string };
}

const CouponFormDialog: React.FC<CouponFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCoupon,
  setNewCoupon,
  validationErrors
}) => (
  <Dialog open={isOpen} onOpenChange={onClose} >
    <DialogContent className="max-h-[90vh] overflow-y-auto"  aria-describedby={undefined}>
      <DialogTitle className="text-lg text-center md:text-xl text md:justify-start">
        Create New Coupon
      </DialogTitle>
      <CouponForm
        onSubmit={onSubmit}
        newCoupon={newCoupon}
        setNewCoupon={setNewCoupon}
        validationErrors={validationErrors}
        onCancel={onClose}
      />
    </DialogContent>
  </Dialog>
);

export default CouponsPage;

