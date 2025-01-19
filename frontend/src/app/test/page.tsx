import { ItemCard } from "@/components/ui/itemCard";

export default function TestPage() {
  // Sample data for testing
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    title: `Test Item ${i + 1}`,
    description:
      "This is a sample item description that will be truncated if it gets too long for the card.",
    price: Math.floor(Math.random() * 900) + 100,
    imageUrl: "/images/test.png",
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            itemID={item.id}
            title={item.title}
            description={item.description}
            price={item.price}
            imageUrl={item.imageUrl}
            actionButton={
              <button className="px-4 py-2 bg-black text-white rounded-lg">
                Add to cart
              </button>
            }
          />
        ))}
      </div>
    </div>
  );
}
