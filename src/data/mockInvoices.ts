export interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  caseSize?: string;
  pricePerUnit: number;
  totalPrice: number;
  category: string;
  brand?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  date: string;
  supplier: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms: string;
  deliveryDate: string;
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
        unit: "case",
        caseSize: "10 lb per case",
        pricePerUnit: 89.99,
        totalPrice: 359.96,
        category: "Meat",
        brand: "Sysco Premium",
        notes: "80/20 blend"
      },
      {
        name: "Chicken Breast",
        quantity: 3,
        unit: "case",
        caseSize: "40 lb per case",
        pricePerUnit: 159.99,
        totalPrice: 479.97,
        category: "Meat",
        brand: "Sysco Premium"
      },
      {
        name: "Fresh Tomatoes",
        quantity: 2,
        unit: "case",
        caseSize: "25 lb per case",
        pricePerUnit: 49.99,
        totalPrice: 99.98,
        category: "Produce"
      },
      {
        name: "All-Purpose Flour",
        quantity: 5,
        unit: "bag",
        caseSize: "50 lb per bag",
        pricePerUnit: 29.99,
        totalPrice: 149.95,
        category: "Dry Goods",
        brand: "Gold Medal"
      },
      {
        name: "Cooking Oil",
        quantity: 2,
        unit: "case",
        caseSize: "35 lb per case",
        pricePerUnit: 79.99,
        totalPrice: 159.98,
        category: "Oils",
        brand: "Sysco"
      }
    ],
    subtotal: 1249.84,
    tax: 112.49,
    total: 1362.33,
    paymentTerms: "Net 30",
    deliveryDate: "2024-03-16"
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
        unit: "case",
        caseSize: "15 lb per case",
        pricePerUnit: 199.99,
        totalPrice: 399.98,
        category: "Seafood",
        brand: "US Foods Premium"
      },
      {
        name: "Mixed Greens",
        quantity: 3,
        unit: "case",
        caseSize: "5 lb per case",
        pricePerUnit: 39.99,
        totalPrice: 119.97,
        category: "Produce"
      },
      {
        name: "Pasta",
        quantity: 4,
        unit: "case",
        caseSize: "20 lb per case",
        pricePerUnit: 45.99,
        totalPrice: 183.96,
        category: "Dry Goods",
        brand: "Barilla"
      },
      {
        name: "Wine",
        quantity: 6,
        unit: "case",
        caseSize: "12 bottles per case",
        pricePerUnit: 159.99,
        totalPrice: 959.94,
        category: "Beverages",
        brand: "Various"
      },
      {
        name: "Dish Soap",
        quantity: 2,
        unit: "case",
        caseSize: "4 gallons per case",
        pricePerUnit: 89.99,
        totalPrice: 179.98,
        category: "Cleaning Supplies",
        brand: "Ecolab"
      }
    ],
    subtotal: 1843.83,
    tax: 165.94,
    total: 2009.77,
    paymentTerms: "Net 30",
    deliveryDate: "2024-03-17"
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
        unit: "case",
        caseSize: "15 lb per case",
        pricePerUnit: 299.99,
        totalPrice: 299.99,
        category: "Meat",
        brand: "GFS Premium"
      },
      {
        name: "Fresh Vegetables",
        quantity: 3,
        unit: "case",
        caseSize: "15 lb per case",
        pricePerUnit: 69.99,
        totalPrice: 209.97,
        category: "Produce"
      },
      {
        name: "Rice",
        quantity: 3,
        unit: "bag",
        caseSize: "50 lb per bag",
        pricePerUnit: 49.99,
        totalPrice: 149.97,
        category: "Dry Goods",
        brand: "GFS"
      },
      {
        name: "Paper Towels",
        quantity: 4,
        unit: "case",
        caseSize: "12 rolls per case",
        pricePerUnit: 39.99,
        totalPrice: 159.96,
        category: "Paper Goods"
      },
      {
        name: "Hand Soap",
        quantity: 2,
        unit: "case",
        caseSize: "4 gallons per case",
        pricePerUnit: 79.99,
        totalPrice: 159.98,
        category: "Cleaning Supplies",
        brand: "GFS"
      }
    ],
    subtotal: 979.87,
    tax: 88.19,
    total: 1068.06,
    paymentTerms: "Net 30",
    deliveryDate: "2024-03-18"
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
        unit: "case",
        caseSize: "5 lb per case",
        pricePerUnit: 149.99,
        totalPrice: 299.98,
        category: "Seafood",
        brand: "PFG Premium"
      },
      {
        name: "Fresh Herbs",
        quantity: 1,
        unit: "case",
        caseSize: "5 lb per case",
        pricePerUnit: 89.99,
        totalPrice: 89.99,
        category: "Produce"
      },
      {
        name: "Olive Oil",
        quantity: 2,
        unit: "case",
        caseSize: "3 gallons per case",
        pricePerUnit: 129.99,
        totalPrice: 259.98,
        category: "Oils",
        brand: "PFG"
      },
      {
        name: "Beer",
        quantity: 8,
        unit: "case",
        caseSize: "24 cans per case",
        pricePerUnit: 49.99,
        totalPrice: 399.92,
        category: "Beverages",
        brand: "Various"
      },
      {
        name: "To-Go Containers",
        quantity: 3,
        unit: "case",
        caseSize: "500 units per case",
        pricePerUnit: 79.99,
        totalPrice: 239.97,
        category: "Disposables"
      }
    ],
    subtotal: 1289.84,
    tax: 116.09,
    total: 1405.93,
    paymentTerms: "Net 30",
    deliveryDate: "2024-03-19"
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
        unit: "case",
        caseSize: "10 lb per case",
        pricePerUnit: 129.99,
        totalPrice: 389.97,
        category: "Meat",
        brand: "BEK Premium"
      },
      {
        name: "Fresh Fruit",
        quantity: 2,
        unit: "case",
        caseSize: "20 lb per case",
        pricePerUnit: 89.99,
        totalPrice: 179.98,
        category: "Produce"
      },
      {
        name: "Sugar",
        quantity: 2,
        unit: "bag",
        caseSize: "50 lb per bag",
        pricePerUnit: 59.99,
        totalPrice: 119.98,
        category: "Dry Goods",
        brand: "BEK"
      },
      {
        name: "Soft Drinks",
        quantity: 5,
        unit: "case",
        caseSize: "24 bottles per case",
        pricePerUnit: 29.99,
        totalPrice: 149.95,
        category: "Beverages",
        brand: "Various"
      },
      {
        name: "Napkins",
        quantity: 4,
        unit: "case",
        caseSize: "1000 units per case",
        pricePerUnit: 49.99,
        totalPrice: 199.96,
        category: "Paper Goods"
      }
    ],
    subtotal: 1039.84,
    tax: 93.59,
    total: 1133.43,
    paymentTerms: "Net 30",
    deliveryDate: "2024-03-20"
  }
]; 