"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";

// Define types
interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  sellerName: string;
  sellerEmail: string;
  categories: string[];
  imageUrl: string;
}

const categories = [
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports",
  "Music",
  "Art",
  "Others",
];

export default function ExplorePage() {
  const [items, setItems] = useState<Item[]>([]); // Replace with actual API call
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    const fetchItems = async () => {
      // Replace with actual API call
      setTimeout(() => {
        setItems([
          {
            id: "1",
            name: "MacBook Pro",
            price: 80000,
            description: "2021 Model, M1 Chip, 16GB RAM",
            sellerName: "John Doe",
            sellerEmail: "john.doe@iiit.ac.in",
            categories: ["Electronics", "Books"],
            imageUrl: "/images/test.png",
          },
          {
            id: "2",
            name: "MacBook Air",
            price: 800000,
            description: "2022 Model, M2 Chip, 128GB RAM",
            sellerName: "John Doe",
            sellerEmail: "john.doe@iiit.ac.in",
            categories: ["Electronics", "Music"],
            imageUrl: "/images/test2.png",
          },
          // Add more items...
        ]);
        setIsLoading(false);
      }, 1500);
    };

    fetchItems();
  }, []);

  // Filter items based on search and categories
  useEffect(() => {
    let result = items;

    if (searchQuery) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((item) =>
        item.categories.some((cat) => selectedCategories.includes(cat))
      );
    }

    setFilteredItems(result);
  }, [items, searchQuery, selectedCategories]);

  return (
    <div className="min-h-screen p-6">
      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-full h-12 text-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <motion.div
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    isSelected
                      ? "bg-black text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    setSelectedCategories(
                      isSelected
                        ? selectedCategories.filter((c) => c !== category)
                        : [...selectedCategories, category]
                    );
                  }}
                >
                  {category}
                  {isSelected && <X className="ml-2 h-4 w-4 inline-block" />}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
                  ))
              : filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ItemCard item={item} />
                  </motion.div>
                ))}
          </div>
        </AnimatePresence>

        {/* No Results */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-2">No items found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/explore/item/${item.id}`}>
      <CardContainer>
        <CardBody className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative group/card w-full rounded-xl p-6">
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-black dark:text-white"
          >
            {item.name}
          </CardItem>

          <CardItem
            translateZ="60"
            className="text-neutral-500 text-sm mt-2 dark:text-neutral-300"
          >
            {item.description}
          </CardItem>

          <CardItem translateZ="100" className="w-full mt-4">
            <Image
              src={item.imageUrl}
              height={1000}
              width={1000}
              className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
              alt={item.name}
            />
          </CardItem>

          <div className="flex justify-between items-center mt-6">
            <CardItem
              translateZ={20}
              className="text-lg font-bold text-black dark:text-white"
            >
              ₹{item.price.toLocaleString()}
            </CardItem>
            <CardItem
              translateZ={20}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              by {item.sellerName}
            </CardItem>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.categories.map((category) => (
                <CardItem
                key={category}
                translateZ={20}
                className="w-fit px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                >
                {category}
                </CardItem>
            ))}
          </div>
        </CardBody>
      </CardContainer>
    </Link>
  );
}
