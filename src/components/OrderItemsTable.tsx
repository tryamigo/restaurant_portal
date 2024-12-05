// components/OrderItemsTable.tsx
import React from "react";
import Image from "next/image";
import { OrderItem } from "@/components/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrderItemsTableProps {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  isMobile?: boolean;
}

const truncateText = (text: string, maxLength = 20): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  items,
  subtotal,
  discount,
  total,
  isMobile,
}) => {
  const renderDesktopTable = () => (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden dark:bg-gray-900 dark:shadow-none">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              {["Image", "Product", "Quantity", "Price", "Total"].map(
                (header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-${
                      header === "Total" ? "right" : "left"
                    } text-sm font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors hover:dark:bg-gray-800"
              >
                {/* Image column */}
                <td className="px-6 py-4">
                  <Image
                    src={item.imageLink}
                    alt="Image"
                    width={48}
                    height={48}
                    className="rounded-md object-cover"
                  />
                </td>

                {/* Product details column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    {item?.name?.length > 20 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="font-medium text-gray-800 dark:text-gray-300">
                              {truncateText(item.name)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="font-medium text-gray-800 dark:text-gray-300">
                        {item.name}
                      </div>
                    )}
                  </div>
                  {/* Description column if you want to comment it out */}
                  {/* <div>
                    {item?.description?.length > 20 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {truncateText(item.description)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    )}
                  </div> */}
                </td>

                {/* Quantity column */}
                <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>

                {/* Price column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{item.price ? Number(item.price).toFixed(2) : "N/A"}
                </td>

                {/* Total column */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {[
              { label: "Subtotal:", value: subtotal, className: "" },
              {
                label: "Discount:",
                value: discount,
                className: "text-green-600",
              },
              { label: "Total Payable:", value: total, className: "font-bold" },
            ].map(({ label, value, className }) => (
              <tr key={label}>
                <td colSpan={4} className={`px-6 py-3 text-right ${className}`}>
                  {label}
                </td>
                <td className={`px-6 py-3 text-right ${className}`}>
                  {value > 0
                    ? `₹${value.toFixed(2)}`
                    : `-₹${Math.abs(value).toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tfoot>
        </table>
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div className="block md:hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center border-b p-4"
        >
          <div className="flex items-center space-x-4">
            {item.imageLink && (
              <Image
                src={item.imageLink}
                alt={item.name}
                width={48}
                height={48}
                className="rounded-md object-cover"
              />
            )}
            <div>
              <div className="font-medium text-gray-800">{item.name}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span>{item.quantity}</span>
            <span>₹{item.price ? Number(item.price).toFixed(2) : "N/A"}</span>
            <span className="font-bold">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
      <div className="flex justify-between font-bold p-4">
        <span>Subtotal:</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-green-600 p-4">
        <span>Discount:</span>
        <span>-₹{discount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold p-4">
        <span>Total Payable:</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopTable();
};
