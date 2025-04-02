import { Product } from "@/types/inventory";

export const mockProducts: Partial<Product>[] = [
  // Grains
  {
    name: "McCann's Quick Cooking Irish Oatmeal",
    category: "Grains",
    unit: "box",
    currentStock: 8,
    reorderPoint: 5,
    cost: 4.50,
    image: null
  },
  {
    name: "Jasmine Rice",
    category: "Grains",
    unit: "lb",
    currentStock: 42,
    reorderPoint: 25,
    cost: 2.99,
    image: null
  },

  // Meat
  {
    name: "Ground Beef",
    category: "Meat",
    unit: "lb",
    currentStock: 12,
    reorderPoint: 15,
    cost: 5.99,
    image: null
  },
  {
    name: "Chicken Breast",
    category: "Meat",
    unit: "lb",
    currentStock: 28,
    reorderPoint: 20,
    cost: 4.99,
    image: null
  },

  // Produce
  {
    name: "Fresh Tomatoes",
    category: "Produce",
    unit: "lb",
    currentStock: 18,
    reorderPoint: 15,
    cost: 2.99,
    image: null
  },
  {
    name: "Fresh Herbs",
    category: "Produce",
    unit: "bunch",
    currentStock: 4,
    reorderPoint: 8,
    cost: 1.99,
    image: null
  },

  // Pantry
  {
    name: "Olive Oil",
    category: "Pantry",
    unit: "bottle",
    currentStock: 6,
    reorderPoint: 8,
    cost: 15.99,
    image: null
  },
  {
    name: "All-Purpose Flour",
    category: "Pantry",
    unit: "lb",
    currentStock: 35,
    reorderPoint: 25,
    cost: 1.99,
    image: null
  },

  // Beverages
  {
    name: "Vintage Seltzer Original",
    category: "Beverages",
    unit: "case",
    currentStock: 3,
    reorderPoint: 6,
    cost: 12.99,
    image: null
  },
  {
    name: "Fresh Coffee Beans",
    category: "Beverages",
    unit: "lb",
    currentStock: 22,
    reorderPoint: 15,
    cost: 14.99,
    image: null
  },

  // Supplies
  {
    name: "To-Go Containers",
    category: "Supplies",
    unit: "case",
    currentStock: 2,
    reorderPoint: 4,
    cost: 24.99,
    image: null
  },
  {
    name: "Paper Napkins",
    category: "Supplies",
    unit: "case",
    currentStock: 5,
    reorderPoint: 3,
    cost: 18.99,
    image: null
  }
]; 