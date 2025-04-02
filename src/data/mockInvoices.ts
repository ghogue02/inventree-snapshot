export interface InvoiceItem {
  name: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface Invoice {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  total: number;
  items: InvoiceItem[];
}

export const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    date: "2024-03-15",
    supplier: "Sysco Food Services",
    invoiceNumber: "SYS-2024-001",
    items: [
      {
        name: "Ground Beef",
        quantity: 4,
        pricePerUnit: 89.99,
        total: 359.96
      },
      {
        name: "Chicken Breast",
        quantity: 3,
        pricePerUnit: 159.99,
        total: 479.97
      },
      {
        name: "Fresh Tomatoes",
        quantity: 2,
        pricePerUnit: 49.99,
        total: 99.98
      },
      {
        name: "All-Purpose Flour",
        quantity: 5,
        pricePerUnit: 29.99,
        total: 149.95
      },
      {
        name: "Cooking Oil",
        quantity: 2,
        pricePerUnit: 79.99,
        total: 159.98
      }
    ],
    total: 1249.84
  },
  {
    id: "INV-002",
    date: "2024-03-16",
    supplier: "US Foods",
    invoiceNumber: "USF-2024-002",
    items: [
      {
        name: "Salmon Fillet",
        quantity: 2,
        pricePerUnit: 199.99,
        total: 399.98
      },
      {
        name: "Mixed Greens",
        quantity: 3,
        pricePerUnit: 39.99,
        total: 119.97
      },
      {
        name: "Pasta",
        quantity: 4,
        pricePerUnit: 45.99,
        total: 183.96
      },
      {
        name: "Wine",
        quantity: 6,
        pricePerUnit: 159.99,
        total: 959.94
      },
      {
        name: "Dish Soap",
        quantity: 2,
        pricePerUnit: 89.99,
        total: 179.98
      }
    ],
    total: 1843.83
  },
  {
    id: "INV-003",
    date: "2024-03-17",
    supplier: "Gordon Food Service",
    invoiceNumber: "GFS-2024-003",
    items: [
      {
        name: "Beef Tenderloin",
        quantity: 1,
        pricePerUnit: 299.99,
        total: 299.99
      },
      {
        name: "Fresh Vegetables",
        quantity: 3,
        pricePerUnit: 69.99,
        total: 209.97
      },
      {
        name: "Rice",
        quantity: 3,
        pricePerUnit: 49.99,
        total: 149.97
      },
      {
        name: "Paper Towels",
        quantity: 4,
        pricePerUnit: 39.99,
        total: 159.96
      },
      {
        name: "Hand Soap",
        quantity: 2,
        pricePerUnit: 79.99,
        total: 159.98
      }
    ],
    total: 979.87
  },
  {
    id: "INV-004",
    date: "2024-03-18",
    supplier: "Performance Food Group",
    invoiceNumber: "PFG-2024-004",
    items: [
      {
        name: "Shrimp",
        quantity: 2,
        pricePerUnit: 149.99,
        total: 299.98
      },
      {
        name: "Fresh Herbs",
        quantity: 1,
        pricePerUnit: 89.99,
        total: 89.99
      },
      {
        name: "Olive Oil",
        quantity: 2,
        pricePerUnit: 129.99,
        total: 259.98
      },
      {
        name: "Beer",
        quantity: 8,
        pricePerUnit: 49.99,
        total: 399.92
      },
      {
        name: "To-Go Containers",
        quantity: 3,
        pricePerUnit: 79.99,
        total: 239.97
      }
    ],
    total: 1289.84
  },
  {
    id: "INV-005",
    date: "2024-03-19",
    supplier: "Ben E. Keith Foods",
    invoiceNumber: "BEK-2024-005",
    items: [
      {
        name: "Pork Tenderloin",
        quantity: 3,
        pricePerUnit: 129.99,
        total: 389.97
      },
      {
        name: "Fresh Fruit",
        quantity: 2,
        pricePerUnit: 89.99,
        total: 179.98
      },
      {
        name: "Sugar",
        quantity: 2,
        pricePerUnit: 59.99,
        total: 119.98
      },
      {
        name: "Soft Drinks",
        quantity: 5,
        pricePerUnit: 29.99,
        total: 149.95
      },
      {
        name: "Napkins",
        quantity: 4,
        pricePerUnit: 49.99,
        total: 199.96
      }
    ],
    total: 1039.84
  }
]; 