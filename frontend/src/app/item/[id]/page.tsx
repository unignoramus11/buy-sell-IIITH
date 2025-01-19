"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  ShoppingCart,
  Clock,
  Users,
  Share2,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Lens } from "@/components/ui/lens";
import { AnimatePresence, motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

// TODO: Replace this with actual product data
const productData = {
  title: "iPhone 15 Pro Max - 256GB",
  description:
    "Brand new, sealed pack. Space black variant with original bill and warranty.",
  price: 149900,
  seller: {
    name: "John Doe",
    rating: 4.5,
    totalSales: 28,
    avatar: "/images/test.png",
    responseTime: "2 hours",
    verifiedSince: "2022",
    ratingBreakdown: {
      5: 80,
      4: 15,
      3: 3,
      2: 1,
      1: 1,
    },
  },
  categories: ["Electronics", "Mobile", "Apple", "Premium"],
  images: ["/images/test.png", "/images/test2.png", "/images/test3.png"],
  createdAt: new Date(),
  cartCount: 5,
  specs: {
    Storage: "256GB",
    Color: "Space Black",
    Condition: "New",
    Warranty: "1 Year Apple Warranty",
    "Package Contents": "iPhone, Cable, Documentation",
    Gei: "Yes",
  },
};

// TODO: dynamically generate this based on category
const categoryColors: Record<string, string> = {
  Electronics: "bg-blue-500/10 text-blue-500",
  Mobile: "bg-purple-500/10 text-purple-500",
  Apple: "bg-gray-500/10 text-gray-500",
  Premium: "bg-amber-500/10 text-amber-500",
};

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();
  const [hovering, setHovering] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(price / 100);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl pb-24 lg:pb-8">
        {/* Breadcrumb and Share */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/search/electronics">
                    Electronics
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{productData.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Button
              variant="secondary"
              size="icon"
              className="rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="relative aspect-[4/3] group overflow-hidden rounded-2xl">
                <Lens hovering={hovering} setHovering={setHovering}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImage}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={productData.images[selectedImage]}
                        alt={productData.title}
                        fill
                        className="object-contain rounded-lg cursor-zoom-in"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </Lens>
              </div>

              <motion.div
                animate={{
                  filter: hovering ? "blur(2px)" : "blur(0px)",
                }}
                className="py-4 relative z-20"
              >
                <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                  <div className="flex space-x-2 p-1">
                    {productData.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-24 aspect-square flex-shrink-0 rounded-md overflow-hidden transition-all
                      ${
                        selectedImage === index
                          ? "ring-2 ring-blue-500"
                          : "ring-1 ring-gray-200"
                      }
                      hover:ring-2 hover:ring-blue-400`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-4">
              <div className="space-y-6">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {productData.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className={`${categoryColors[category]} font-medium rounded-full px-4`}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Title and Description */}
                <div>
                  <h1 className="text-4xl font-bold">
                    <TextGenerateEffect words={productData.title} />
                  </h1>
                  <p className="text-lg text-gray-600 mt-2">
                    {productData.description}
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-4">
                    {formatPrice(productData.price)}
                  </p>
                </div>

                <Separator className="bg-gray-100" />

                {/* Seller Section */}
                {/* TODO: migrate seller info to a separate page */}
                <Sheet>
                  <SheetTrigger asChild>
                    <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={productData.seller.avatar} />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {productData.seller.name}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                          <span>{productData.seller.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{productData.seller.totalSales} sales</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Seller Information</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={productData.seller.avatar} />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {productData.seller.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Verified seller since{" "}
                            {productData.seller.verifiedSince}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Rating Breakdown</h4>
                        {Object.entries(productData.seller.ratingBreakdown)
                          .reverse()
                          .map(([rating, percentage]) => (
                            <div
                              key={rating}
                              className="flex items-center gap-4"
                            >
                              <div className="w-20 flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                                <span>{rating}</span>
                              </div>
                              <Progress value={percentage} className="flex-1" />
                              <span className="w-12 text-sm text-gray-500">
                                {percentage}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Separator className="bg-gray-100" />

                {/* Specifications */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(productData.specs).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-sm text-gray-500">{key}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Listed {format(productData.createdAt, "PPP")}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {productData.cartCount} in cart
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full font-bold rounded-xl h-14 text-lg shadow-lg shadow-blue-500/20 hidden lg:flex"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t backdrop-blur-lg bg-white/80 lg:hidden">
        <div className="container mx-auto max-w-7xl">
          <Button
            size="lg"
            className="w-full h-14 font-bold rounded-xl text-lg shadow-lg shadow-blue-500/20"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
