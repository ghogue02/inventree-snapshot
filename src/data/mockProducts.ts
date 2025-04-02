import { Product } from "@/types/inventory";

export const mockProducts: Partial<Product>[] = [
  // Grains
  {
    name: "McCann's Quick Cooking Irish Oatmeal",
    category: "Grains",
    unit: "box",
    current_stock: 12,
    reorder_point: 5,
    cost: 4.50,
    image: null
  },
  {
    name: "Jasmine Rice",
    category: "Grains",
    unit: "lb",
    current_stock: 50,
    reorder_point: 25,
    cost: 2.99,
    image: null
  },

  // Meat
  {
    name: "Ground Beef",
    category: "Meat",
    unit: "lb",
    current_stock: 25,
    reorder_point: 10,
    cost: 5.99,
    image: null
  },
  {
    name: "Chicken Breast",
    category: "Meat",
    unit: "lb",
    current_stock: 30,
    reorder_point: 15,
    cost: 4.99,
    image: null
  },

  // Produce
  {
    name: "Fresh Tomatoes",
    category: "Produce",
    unit: "lb",
    current_stock: 20,
    reorder_point: 8,
    cost: 2.99,
    image: null
  },
  {
    name: "Fresh Herbs",
    category: "Produce",
    unit: "bunch",
    current_stock: 15,
    reorder_point: 5,
    cost: 1.99,
    image: null
  },

  // Pantry
  {
    name: "Olive Oil",
    category: "Pantry",
    unit: "bottle",
    current_stock: 18,
    reorder_point: 8,
    cost: 15.99,
    image: null
  },
  {
    name: "All-Purpose Flour",
    category: "Pantry",
    unit: "lb",
    current_stock: 40,
    reorder_point: 20,
    cost: 1.99,
    image: null
  },

  // Beverages
  {
    name: "Vintage Seltzer Original",
    category: "Beverages",
    unit: "case",
    current_stock: 15,
    reorder_point: 6,
    cost: 12.99,
    image: null
  },
  {
    name: "Fresh Coffee Beans",
    category: "Beverages",
    unit: "lb",
    current_stock: 25,
    reorder_point: 10,
    cost: 14.99,
    image: null
  },

  // Supplies
  {
    name: "To-Go Containers",
    category: "Supplies",
    unit: "case",
    current_stock: 12,
    reorder_point: 4,
    cost: 24.99,
    image: null
  },
  {
    name: "Paper Napkins",
    category: "Supplies",
    unit: "case",
    current_stock: 8,
    reorder_point: 3,
    cost: 18.99,
    image: null
  }
]; 