
import { Product, Invoice, InventoryCount } from "@/types/inventory";
import { v4 as uuidv4 } from 'uuid';

// Sample product data
export const products: Product[] = [
  {
    id: uuidv4(),
    name: "Tomatoes",
    category: "Produce",
    unit: "kg",
    currentStock: 12,
    reorderPoint: 5,
    cost: 2.99
  },
  {
    id: uuidv4(),
    name: "Onions",
    category: "Produce",
    unit: "kg",
    currentStock: 8,
    reorderPoint: 4,
    cost: 1.49
  },
  {
    id: uuidv4(),
    name: "Chicken Breast",
    category: "Meat",
    unit: "kg",
    currentStock: 6,
    reorderPoint: 5,
    cost: 8.99
  },
  {
    id: uuidv4(),
    name: "Rice",
    category: "Dry Goods",
    unit: "kg",
    currentStock: 18,
    reorderPoint: 10,
    cost: 2.49
  },
  {
    id: uuidv4(),
    name: "Olive Oil",
    category: "Oils & Condiments",
    unit: "liter",
    currentStock: 3,
    reorderPoint: 2,
    cost: 9.99
  },
  {
    id: uuidv4(),
    name: "Salt",
    category: "Spices",
    unit: "kg",
    currentStock: 2,
    reorderPoint: 1,
    cost: 1.29
  }
];

// Sample invoice data
export const invoices: Invoice[] = [
  {
    id: uuidv4(),
    supplierName: "Fresh Foods Inc.",
    invoiceNumber: "INV-2023-001",
    date: new Date("2023-11-15"),
    total: 234.56,
    paidStatus: "paid",
    items: [
      {
        id: uuidv4(),
        invoiceId: "",
        productId: products[0].id,
        product: products[0],
        quantity: 10,
        unitPrice: 2.99,
        total: 29.90
      },
      {
        id: uuidv4(),
        invoiceId: "",
        productId: products[1].id,
        product: products[1],
        quantity: 8,
        unitPrice: 1.49,
        total: 11.92
      }
    ]
  },
  {
    id: uuidv4(),
    supplierName: "Premium Meats",
    invoiceNumber: "INV-2023-045",
    date: new Date("2023-11-20"),
    total: 321.87,
    paidStatus: "paid",
    items: [
      {
        id: uuidv4(),
        invoiceId: "",
        productId: products[2].id,
        product: products[2],
        quantity: 12,
        unitPrice: 8.99,
        total: 107.88
      }
    ]
  }
];

// Set the invoice IDs correctly
invoices.forEach(invoice => {
  invoice.items.forEach(item => {
    item.invoiceId = invoice.id;
  });
});

// Sample inventory count data
export const inventoryCounts: InventoryCount[] = [
  {
    id: uuidv4(),
    productId: products[0].id,
    product: products[0],
    count: 12,
    countedAt: new Date("2023-11-25"),
    countMethod: "manual",
    notes: "End of day count"
  },
  {
    id: uuidv4(),
    productId: products[1].id,
    product: products[1],
    count: 8,
    countedAt: new Date("2023-11-25"),
    countMethod: "manual",
    notes: "End of day count"
  },
  {
    id: uuidv4(),
    productId: products[2].id,
    product: products[2],
    count: 6,
    countedAt: new Date("2023-11-25"),
    countMethod: "video",
    notes: "Automated count from video scan"
  }
];
