// components/OrderRow.tsx
import React from "react";
import { motion } from "framer-motion";
import { Order } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Eye,
  MapPin,
  HandPlatter,
  Star,
  Clock,
  CookingPot,
  CalendarArrowUp,
  CircleX,
  CalendarArrowDown,
  Package,
} from "lucide-react";

interface OrderRowProps {
  order: Order;
  onView: (id: string) => void;
  isMobile?: boolean;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, onView, isMobile }) => {
  const STATUS_ICONS = {
    Pending: <Clock className="text-yellow-600 w-5 h-5" />,
    "Order Received": <CalendarArrowDown className="text-cyan-600 w-5 h-5" />,
    Preparing: <CookingPot className="text-indigo-600 w-5 h-5" />,
    "Ready for Pickup": <Package className="text-orange-600 w-5 h-5" />,
    "Order Collected": <CalendarArrowUp className="text-green-600 w-5 h-5" />,
    "Ask for Cancel": <CircleX className="text-red-600 w-5 h-5" />,
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Order Received":
        return "bg-cyan-100";
      case "Preparing":
        return "bg-indigo-100";
      case "Ready for Pickup":
        return "bg-orange-100";
      case "Order Collected":
        return "bg-green-100";
      case "Ask for Cancel":
        return "bg-red-100";
      default:
        return "bg-yellow-50";
    }
  };

  // Animation Variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const renderDesktopRow = () => (
    <motion.tr
      className="hover:bg-gray-50 hover:dark:bg-gray-700"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <td className="px-6 py-4 cursor-pointer" onClick={() => onView(order.id)}>
        <div className="font-medium">{order.id.slice(0, 8)}</div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(order.orderTime), "PPp")}
        </div>
      </td>
      <td className="px-6 cursor-pointer" onClick={() => onView(order.id)}>
        {order.userAddress?.name && order.userAddress.name.length > 15 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="font-medium truncate max-w-[50px] overflow-hidden whitespace-nowrap">
                  {order.userAddress?.name || "N/A"}
                </div>
                <div className="text-xs  text-muted-foreground truncate max-w-[50px] overflow-hidden whitespace-nowrap">
                  {order.userAddress?.mobile || "No contact"}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-50 text-black shadow-lg p-2 rounded-md text-sm max-w-[300px]">
                <p>{order.userAddress?.name || "N/A"}</p>
                <p>{order.userAddress?.mobile || "No contact"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <div className="font-medium">
              {order.userAddress?.name || "N/A"}
            </div>
            <div className="text-xs  text-muted-foreground">
              {order.userAddress?.mobile || "No contact"}
            </div>
          </>
        )}
      </td>
      <td className="px-6 cursor-pointer" onClick={() => onView(order.id)}>
        <Badge
          className={`${getStatusColor(
            order.status
          )} text-gray-800 hover:bg-gray-300 flex gap-[10px]`}
        >
          {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]}
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </td>
      <td className="px-6 cursor-pointer" onClick={() => onView(order.id)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-sm">{order.orderItems.length} items</div>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                {order.orderItems.map((item) => (
                  <div key={item.id} className="text-xs">
                    {item.quantity} x {item.name}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="text-xs  text-muted-foreground">
          Total: ₹{Number(order.total).toFixed(2)}
        </div>
      </td>
      <td className="px-6 cursor-pointer" onClick={() => onView(order.id)}>
        <div className="text-sm">
          <div>
            Subtotal: ₹
            {Number(
              order.total - order.deliveryCharge + order.discount
            ).toFixed(2)}
          </div>
          <div className="text-xs  text-muted-foreground">
            Delivery: ₹{Number(order.deliveryCharge).toFixed(2)}
          </div>
          {order.discount > 0 && (
            <div className="text-xs text-green-500">
              Discount: -₹{Number(order.discount).toFixed(2)}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 cursor-pointer" onClick={() => onView(order.id)}>
        <div className="flex flex-col">
          {order.takeFromStore ? (
            <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-300">
              <HandPlatter className="h-4 w-4 mr-2" /> Pick Up
            </Badge>
          ) : (
            <div className="flex flex-col">
              <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                <MapPin className="h-4 w-4 mr-2" /> Delivery
              </Badge>
            </div>
          )}
          {order.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-xs">{order.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </td>
      {/* <td className="px-6 cursor-pointer" onClick={() => onView(order.id)}>
        <button
          onClick={() => onView(order.id)}
          className="text-xs font-semibold flex items-center justify-center px-4 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          aria-label={`View order ${order.id}`}
        >
          <Eye className="w-4 h-4 mr-2" /> <span>View</span>
        </button>
      </td> */}
    </motion.tr>
  );

  const renderMobileRow = () => (
    <motion.div
      className="p-4 bg-white border-b hover:bg-gray-50 hover:dark:bg-gray-700"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="font-medium">{order.id.slice(0, 8)}</div>
          <div className="text-xs  text-muted-foreground">
            {format(new Date(order.orderTime), "PPp")}
          </div>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]}
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="text-sm font-medium">
            {order.userAddress?.name || "N/A"}
          </div>
          <div className="text-xs  text-muted-foreground">
            {order.userAddress?.mobile || "No contact"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm">
            Total: ₹{Number(order.total).toFixed(2)}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => onView(order.id)}>
          <Eye className="h-4 w-4" />
          View
        </Button>
        {order.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-xs">{order.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return isMobile ? renderMobileRow() : renderDesktopRow();
};

export default OrderRow;
