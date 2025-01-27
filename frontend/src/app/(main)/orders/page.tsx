"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  itemID: string;
  itemName: string;
  itemImage: string;
  price: number;
  quantity: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  date: string;
  otp?: string;
  otpExpiry?: string;
  buyer: {
    name: string;
    email: string;
  };
  seller: {
    name: string;
    email: string;
  };
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders([
        {
          id: "1",
          itemID: "1",
          itemName: "MacBook Pro M1",
          itemImage: "/images/test.png",
          price: 85000,
          quantity: 1,
          status: "PENDING",
          date: new Date().toISOString(),
          otp: "123456",
          otpExpiry: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes
          buyer: {
            name: "John Doe",
            email: "john.doe@iiit.ac.in",
          },
          seller: {
            name: "Jane Smith",
            email: "jane.smith@iiit.ac.in",
          },
        },
        {
          id: "1",
          itemID: "1",
          itemName: "MacBook Pro M1",
          itemImage: "/images/test.png",
          price: 85000,
          quantity: 1,
          status: "DELIVERED",
          date: new Date().toISOString(),
          otp: "123456",
          otpExpiry: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes
          buyer: {
            name: "John Doe",
            email: "john.doe@iiit.ac.in",
          },
          seller: {
            name: "Jane Smith",
            email: "jane.smith@iiit.ac.in",
          },
        },
        {
          id: "1",
          itemID: "1",
          itemName: "MacBook Pro M1",
          itemImage: "/images/test.png",
          price: 85000,
          quantity: 1,
          status: "CANCELLED",
          date: new Date().toISOString(),
          otp: "123456",
          otpExpiry: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes
          buyer: {
            name: "John Doe",
            email: "john.doe@iiit.ac.in",
          },
          seller: {
            name: "Jane Smith",
            email: "jane.smith@iiit.ac.in",
          },
        },
        // Add more sample orders...
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const regenerateOTP = async (orderId: string) => {
    // Replace with actual API call
    toast({
      title: "OTP Regenerated",
      description:
        "New OTP has been generated and will be visible for 5 seconds.",
    });
    // Update orders with new OTP
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              otp: Math.floor(100000 + Math.random() * 900000).toString(),
              otpExpiry: new Date(Date.now() + 5 * 60000).toISOString(),
            }
          : order
      )
    );
  };

  const copyOTP = (otp: string) => {
    navigator.clipboard.writeText(otp);
    toast({
      title: "OTP Copied",
      description: "OTP has been copied to clipboard.",
    });
  };

  const getFilteredOrders = (type: string) => {
    const userEmail = "john.doe@iiit.ac.in"; // Replace with actual user email
    switch (type) {
      case "pending":
        return orders.filter(
          (order) =>
            order.status === "PENDING" && order.buyer.email === userEmail
        );
      case "bought":
        return orders.filter(
          (order) =>
            order.buyer.email === userEmail && order.status !== "PENDING"
        );
      case "sold":
        return orders.filter((order) => order.seller.email === userEmail);
      default:
        return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="pending" className="relative">
            Pending Orders
            {getFilteredOrders("pending").length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getFilteredOrders("pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="bought">Purchase History</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {["pending", "bought", "sold"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {isLoading ? (
                <OrdersSkeleton />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {getFilteredOrders(tab).map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      type={tab as "pending" | "bought" | "sold"}
                      onRegenerateOTP={regenerateOTP}
                      onCopyOTP={copyOTP}
                      onShowOTP={() => {
                        setSelectedOrder(order);
                        setShowOTP(true);
                        // Auto-hide OTP after 5 seconds
                        setTimeout(() => setShowOTP(false), 5000);
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>

      {/* OTP Dialog */}
      <Dialog open={showOTP} onOpenChange={setShowOTP}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-2xl font-mono font-bold">
              {selectedOrder?.otp}
            </p>
            <p className="text-center text-sm text-gray-500">
              This OTP will be hidden in{" "}
              {Math.ceil(
                (new Date(selectedOrder?.otpExpiry || "").getTime() -
                  Date.now()) /
                  1000
              )}{" "}
              seconds
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Continue in the same file or create separate components

interface OrderCardProps {
  order: Order;
  type: "pending" | "bought" | "sold";
  onRegenerateOTP: (orderId: string) => void;
  onCopyOTP: (otp: string) => void;
  onShowOTP: () => void;
}

const OrderCard = ({
  order,
  type,
  onRegenerateOTP,
  onCopyOTP,
  onShowOTP,
}: OrderCardProps) => {
  const router = useRouter();
  const [isOTPVisible, setIsOTPVisible] = useState(false);
  const isOTPExpired = new Date(order.otpExpiry || "").getTime() < Date.now();

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "DELIVERED":
        return "text-green-600 bg-green-50 border-green-200";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader
        className="p-0 cursor-pointer"
        onClick={() => router.push(`/explore/item/${order.itemID}`)}
      >
        <div className="relative h-48 w-full">
          <Image
            src={order.itemImage}
            alt={order.itemName}
            fill
            className="object-cover"
          />
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              order.status
            )}`}
          >
            <div className="flex items-center gap-1.5">
              {getStatusIcon(order.status)}
              {order.status}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div
            className="cursor-pointer"
            onClick={() => router.push(`/explore/item/${order.itemID}`)}
          >
            <div>
              <h3 className="font-semibold text-lg">{order.itemName}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(order.date), "PPP")}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold">₹{order.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-semibold text-right">{order.quantity}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {type === "sold" ? "Buyer" : "Seller"}
              </p>
              <p className="font-medium">
                {type === "sold" ? order.buyer.name : order.seller.name}
              </p>
              <p className="text-sm text-gray-500">
                {type === "sold" ? order.buyer.email : order.seller.email}
              </p>
            </div>
          </div>

          {/* OTP Section for Pending Orders */}
          {type === "pending" && order.status === "PENDING" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Order OTP</p>
                {!isOTPExpired && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOTPVisible(!isOTPVisible)}
                  >
                    {isOTPVisible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              {isOTPExpired ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onRegenerateOTP(order.id)}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Regenerate OTP
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono font-bold text-lg bg-gray-50 rounded-md p-2 text-center">
                    {isOTPVisible ? order.otp : "******"}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => order.otp && onCopyOTP(order.otp)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {type === "sold" && order.status === "PENDING" && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={onShowOTP}>
                Complete Delivery
              </Button>
              <Button variant="outline" className="flex-1">
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const OrdersSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-48 bg-gray-200 animate-pulse" />
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
              </div>
              <div className="h-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
