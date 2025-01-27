"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash2,
  ShoppingBag,
  AlertCircle,
  Loader2,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  bargainedPrice: number | null;
  quantity: number;
  image: string;
  seller: {
    name: string;
    email: string;
  };
  bargainStatus: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showBargainDialog, setShowBargainDialog] = useState(false);
  const [bargainPrice, setBargainPrice] = useState("");
  const [bargainMessage, setBargainMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call
    const fetchCartItems = async () => {
      setIsLoading(true);
      // Replace with actual API call
      setTimeout(() => {
        setCartItems([
          {
            id: "1",
            name: "MacBook Pro M1",
            price: 85000,
            bargainedPrice: null,
            quantity: 1,
            image: "/images/test.png",
            seller: {
              name: "John Doe",
              email: "john.doe@iiit.ac.in",
            },
            bargainStatus: "NONE",
          },
          // Add more items...
        ]);
        setIsLoading(false);
      }, 1000);
    };

    fetchCartItems();
  }, []);

  const removeFromCart = async (itemId: string) => {
    // Replace with actual API call
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const inititateBargain = (item: CartItem) => {
    setSelectedItem(item);
    setShowBargainDialog(true);
    setBargainPrice("");
    setBargainMessage("");
  };

  const submitBargain = async () => {
    if (!selectedItem || !bargainPrice || !bargainMessage) return;

    // Replace with actual API call
    const updatedItems = cartItems.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            bargainedPrice: parseFloat(bargainPrice),
            bargainStatus: "PENDING" as const,
          }
        : item
    );
    setCartItems(updatedItems);
    setShowBargainDialog(false);
    toast({
      title: "Bargain request sent",
      description: "The seller will be notified of your offer.",
    });
  };

  const placeOrder = async () => {
    setIsOrdering(true);
    // Replace with actual API call
    setTimeout(() => {
      setCartItems([]);
      setIsOrdering(false);
      toast({
        title: "Order placed successfully",
        description: "Check your orders page for OTP and delivery status.",
      });
    }, 2000);
  };

  const getTotalCost = () => {
    return cartItems.reduce((total, item) => {
      const price = item.bargainedPrice ?? item.price;
      return total + price * item.quantity;
    }, 0);
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <CartItemCard
                    item={item}
                    onRemove={removeFromCart}
                    onBargain={inititateBargain}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getTotalCost().toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{getTotalCost().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={placeOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="mr-2 h-4 w-4" />
                  )}
                  Place Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Bargain Dialog */}
      <Dialog open={showBargainDialog} onOpenChange={setShowBargainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Propose your price and add a message for the seller.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Offer</label>
              <Input
                type="number"
                value={bargainPrice}
                onChange={(e) => setBargainPrice(e.target.value)}
                placeholder="Enter your price"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message to Seller</label>
              <textarea
                value={bargainMessage}
                onChange={(e) => setBargainMessage(e.target.value)}
                placeholder="Explain why you're requesting this price"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBargainDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitBargain}>Send Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Components within the same file or can be separated into their own files

interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onBargain: (item: CartItem) => void;
}

const CartItemCard = ({ item, onRemove, onBargain }: CartItemCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Item Image */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500">Sold by: {item.seller.name}</p>

            {/* Price Section */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {item.bargainedPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{item.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg font-bold">
                    ₹{(item.bargainedPrice ?? item.price).toLocaleString()}
                  </span>
                </div>
                {/* Bargain Status */}
                {item.bargainStatus !== "NONE" && (
                  <div className="flex items-center gap-2 mt-1">
                    {item.bargainStatus === "PENDING" && (
                      <span className="text-sm text-yellow-600 flex items-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        Bargain pending
                      </span>
                    )}
                    {item.bargainStatus === "ACCEPTED" && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <Check size={14} />
                        Offer accepted
                      </span>
                    )}
                    {item.bargainStatus === "REJECTED" && (
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <X size={14} />
                        Offer rejected
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bargain Button */}
              {item.bargainStatus === "NONE" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBargain(item)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare size={16} />
                  Bargain
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyCart = () => {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
        <ShoppingBag size={96} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">
        Looks like you haven't added any items to your cart yet.
      </p>
      <Button asChild>
        <Link href="/explore">Start Shopping</Link>
      </Button>
    </div>
  );
};

const CartSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
