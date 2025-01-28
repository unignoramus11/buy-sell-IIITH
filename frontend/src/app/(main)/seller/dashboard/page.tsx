"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useSeller } from "@/hooks/useSeller";
import { useOrders } from "@/hooks/useOrders";

interface SalesData {
  date: string;
  revenue: number;
  bargainedRevenue: number;
}

interface PendingOrder {
  id: string;
  itemName: string;
  buyer: {
    name: string;
    email: string;
  };
  originalPrice: number;
  bargainedPrice: number | null;
  status: "PENDING" | "BARGAINING";
  date: string;
}

export default function SellerDashboard() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [counterOffer, setCounterOffer] = useState("");
  const { toast } = useToast();
  const { getDashboardStats, getSellerItems, handleBargainRequest } =
    useSeller();
  const { verifyDelivery } = useOrders();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const [stats, items] = await Promise.all([
        getDashboardStats(),
        getSellerItems(),
      ]);

      if (stats) {
        setSalesData(stats.salesData);
        setTotalEarnings(stats.totalEarnings);
      }

      if (items) {
        const pendingOrders = items.filter(
          (item: any) => item.status === "PENDING" || item.hasBargainRequests
        );
        setPendingOrders(pendingOrders);
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const handleDelivery = async (orderId: string) => {
    setShowOTPDialog(true);
    setSelectedOrder(
      pendingOrders.find((order) => order.id === orderId) || null
    );
  };

  const verifyOTP = async () => {
    if (!selectedOrder || !otp) return;

    const result = await verifyDelivery(selectedOrder.id, otp);
    if (result) {
      setShowOTPDialog(false);
      setOTP("");
      // Refresh dashboard data
      const items = await getSellerItems();
      if (items) {
        const pendingOrders = items.filter(
          (item: any) => item.status === "PENDING" || item.hasBargainRequests
        );
        setPendingOrders(pendingOrders);
      }
    }
  };

  const handleBargain = async (
    orderId: string,
    action: "accept" | "reject" | "counter"
  ) => {
    const result = await handleBargainRequest(
      orderId,
      action,
      action === "counter" ? parseFloat(counterOffer) : undefined
    );

    if (result) {
      // Refresh pending orders
      const items = await getSellerItems();
      if (items) {
        const pendingOrders = items.filter(
          (item: any) => item.status === "PENDING" || item.hasBargainRequests
        );
        setPendingOrders(pendingOrders);
      }
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatsCard
          title="Pending Orders"
          value={pendingOrders.length.toString()}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatsCard
          title="Completed Orders"
          value="25"
          icon={<Package className="w-6 h-6" />}
        />
      </div>

      {/* Sales Chart */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Sales Overview</CardTitle>
          <CardDescription className="text-gray-400">
            Compare original vs bargained revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#fff"
                  strokeWidth={2}
                  dot={{ fill: "#fff" }}
                  name="Original Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="bargainedRevenue"
                  stroke="#666"
                  strokeWidth={2}
                  dot={{ fill: "#666" }}
                  name="After Bargaining"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card className="bg-black border-white/10 text-white">
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your pending orders and bargains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.itemName}</TableCell>
                    <TableCell>
                      <div>
                        <p>{order.buyer.name}</p>
                        <p className="text-sm text-gray-400">
                          {order.buyer.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>₹{order.originalPrice.toLocaleString()}</p>
                        {order.bargainedPrice && (
                          <p className="text-sm text-gray-400">
                            Offered: ₹{order.bargainedPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "PENDING" ? "default" : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.status === "BARGAINING" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleBargain(order.id, "accept")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBargain(order.id, "reject")}
                            className="text-black"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleDelivery(order.id)}
                        >
                          Complete Delivery
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* OTP Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Delivery OTP</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOTPDialog(false)}>
              Cancel
            </Button>
            <Button onClick={verifyOTP}>Verify & Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Continue in the same file or create separate components

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, icon }: StatsCardProps) => {
  return (
    <Card className="bg-black border-white/10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-full text-white">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-white/5 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-white/5 rounded animate-pulse" />
        </CardContent>
      </Card>

      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
