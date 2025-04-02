import { Invoice, InvoiceItem } from "@/types/inventory";

export const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    date: "2024-03-18",
    supplier: "Restaurant Depot",
    invoiceNumber: "RD-2024-1842",
    items: [
      {
        name: "McCann's Quick Cooking Irish Oatmeal",
        quantity: 10,
        pricePerUnit: 4.25,
        total: 42.50
      },
      {
        name: "Jasmine Rice",
        quantity: 50,
        pricePerUnit: 2.75,
        total: 137.50
      },
      {
        name: "All-Purpose Flour",
        quantity: 40,
        pricePerUnit: 1.85,
        total: 74.00
      }
    ],
    total: 254.00
  },
  {
    id: "INV-002",
    date: "2024-03-19",
    supplier: "Premium Meats Co.",
    invoiceNumber: "PMC-2024-0456",
    items: [
      {
        name: "Ground Beef",
        quantity: 15,
        pricePerUnit: 5.75,
        total: 86.25
      },
      {
        name: "Chicken Breast",
        quantity: 30,
        pricePerUnit: 4.75,
        total: 142.50
      }
    ],
    total: 228.75
  },
  {
    id: "INV-003",
    date: "2024-03-20",
    supplier: "Fresh Produce Direct",
    invoiceNumber: "FPD-2024-789",
    items: [
      {
        name: "Fresh Tomatoes",
        quantity: 20,
        pricePerUnit: 2.85,
        total: 57.00
      },
      {
        name: "Fresh Herbs",
        quantity: 10,
        pricePerUnit: 1.85,
        total: 18.50
      }
    ],
    total: 75.50
  },
  {
    id: "INV-004",
    date: "2024-03-21",
    supplier: "Pantry Essentials",
    invoiceNumber: "PE-2024-2341",
    items: [
      {
        name: "Olive Oil",
        quantity: 8,
        pricePerUnit: 15.50,
        total: 124.00
      },
      {
        name: "To-Go Containers",
        quantity: 3,
        pricePerUnit: 24.50,
        total: 73.50
      },
      {
        name: "Paper Napkins",
        quantity: 5,
        pricePerUnit: 18.50,
        total: 92.50
      }
    ],
    total: 290.00
  },
  {
    id: "INV-005",
    date: "2024-03-22",
    supplier: "Beverage Supply Co.",
    invoiceNumber: "BSC-2024-567",
    items: [
      {
        name: "Vintage Seltzer Original",
        quantity: 5,
        pricePerUnit: 12.50,
        total: 62.50
      },
      {
        name: "Fresh Coffee Beans",
        quantity: 25,
        pricePerUnit: 14.75,
        total: 368.75
      }
    ],
    total: 431.25
  }
]; 