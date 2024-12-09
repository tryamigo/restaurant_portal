"use client";
import React from "react";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { OrderStatusDisplay } from "@/components/OrderStatusDisplay";
import { OrderItemsTable } from "@/components/OrderItemsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomButton } from "@/components/CustomButton";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { OrderStatus } from "@/components/types";

const OrderDetails: React.FC = () => {
  const params = useParams();
  const id = params.id as string;

  const {
    order,
    editedOrder,
    isEditDialogOpen,
    setEditedOrder,
    setIsEditDialogOpen,
    updateOrderStatus,
    calculateOrderTotals,
  } = useOrderDetails(id);

  if (!order)
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-24 md:h-32 w-full" />
          ))}
        </div>
      </div>
    );

  const { subtotal, discount, total } = calculateOrderTotals(order.orderItems);

  // Conditional status options based on takeFromStore
  const statusOptions = [
    "Pending",
    "Order Received",
    "Preparing",
    "Ready for Pickup",
    "Order Collected",
    "Ask for cancel",
  ];

  return (
    <>
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-6xl px-4 pt-24 md:py-5 pb-6"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold">
              Order #{order.id}
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 dark:text-gray-300">
              Placed on {format(new Date(order.orderTime), "PPp")}
            </p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <Link href="/orders" className="w-full md:w-auto">
              <CustomButton className="w-full justify-center">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Orders
              </CustomButton>
            </Link>
            <CustomButton
              onClick={() => setIsEditDialogOpen(true)}
              className="w-full md:w-auto justify-center"
            >
              Update Status
            </CustomButton>
          </div>
        </div>
        {/* Order Status */}
        <OrderStatusDisplay
          status={order.status}
          takeFromStore={order.takeFromStore}
        />

        {/* Order Items Table */}
        <OrderItemsTable
          items={order.orderItems}
          subtotal={subtotal}
          discount={discount}
          total={total}
        />

        {/* Edit Status Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Order Status</DialogTitle>
              <DialogDescription>
                Update the status of this order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Order Status</Label>
              <Select
                value={editedOrder?.status}
                onValueChange={(value: OrderStatus) =>
                  setEditedOrder((prev) => ({ ...prev!, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status, index) => {
                    return (
                      <SelectItem key={index} value={status}>
                        {status}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <CustomButton onClick={updateOrderStatus}>
                Save Changes
              </CustomButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
};

export default OrderDetails;
