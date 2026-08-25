export const initialOrders = [
  {
    id: "BTC-847291",
    customerName: "Ananya Sharma",
    customerEmail: "ananya.sharma@example.com",
    customerPhone: "+91 98765 43210",
    shippingAddress: {
      addressLine1: "Flat 402, Green Valley Heights",
      addressLine2: "Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033"
    },
    orderDate: "2026-08-24 14:32",
    items: [
      { id: "prod_001", name: "Turmeric Glow Face Wash", price: 399, quantity: 2 },
      { id: "prod_002", name: "Pigmentation Corrector Serum", price: 599, quantity: 1 }
    ],
    subtotal: 1397,
    discount: 139,
    shippingFee: 0,
    totalAmount: 1258,
    paymentMethod: "COD",
    paymentStatus: "Pending",
    orderStatus: "Processing"
  },
  {
    id: "BTC-847292",
    customerName: "Rohan Mehta",
    customerEmail: "rohan.mehta@example.com",
    customerPhone: "+91 98123 45678",
    shippingAddress: {
      addressLine1: "12B, Ocean Crest Apartments",
      addressLine2: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050"
    },
    orderDate: "2026-08-23 11:15",
    items: [
      { id: "prod_005", name: "Carrot Puree Cold Process Soap", price: 235, quantity: 3 }
    ],
    subtotal: 705,
    discount: 0,
    shippingFee: 50,
    totalAmount: 755,
    paymentMethod: "Manual",
    paymentStatus: "Paid",
    orderStatus: "Delivered"
  },
  {
    id: "BTC-847293",
    customerName: "Priya Verma",
    customerEmail: "priya.verma@example.com",
    customerPhone: "+91 99887 76655",
    shippingAddress: {
      addressLine1: "88, Sector 15",
      addressLine2: "DLF Phase 2",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002"
    },
    orderDate: "2026-08-22 18:45",
    items: [
      { id: "prod_004", name: "Sunscreen Gel SPF 50 PA++++", price: 599, quantity: 2 },
      { id: "prod_007", name: "Herbal Hair Regrowth Oil", price: 499, quantity: 1 }
    ],
    subtotal: 1697,
    discount: 200,
    shippingFee: 0,
    totalAmount: 1497,
    paymentMethod: "Manual",
    paymentStatus: "Paid",
    orderStatus: "Shipped"
  },
  {
    id: "BTC-847294",
    customerName: "Sneha Reddy",
    customerEmail: "sneha.reddy@example.com",
    customerPhone: "+91 91234 56789",
    shippingAddress: {
      addressLine1: "45, Indiranagar 10th Main",
      addressLine2: "Near Metro Station",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038"
    },
    orderDate: "2026-08-21 09:20",
    items: [
      { id: "prod_003", name: "Acne Control Salicylic Cleanser", price: 499, quantity: 1 }
    ],
    subtotal: 499,
    discount: 50,
    shippingFee: 50,
    totalAmount: 499,
    paymentMethod: "COD",
    paymentStatus: "Pending",
    orderStatus: "Pending"
  },
  {
    id: "BTC-847295",
    customerName: "Vikramaditya Singh",
    customerEmail: "vikram.singh@example.com",
    customerPhone: "+91 97654 32109",
    shippingAddress: {
      addressLine1: "C-14, Civil Lines",
      addressLine2: "Opposite High Court",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302006"
    },
    orderDate: "2026-08-20 16:10",
    items: [
      { id: "prod_008", name: "Eco-Friendly Dish Liquid Refill", price: 349, quantity: 2 }
    ],
    subtotal: 698,
    discount: 0,
    shippingFee: 50,
    totalAmount: 748,
    paymentMethod: "COD",
    paymentStatus: "Failed",
    orderStatus: "Cancelled"
  }
];

// Generate up to 25 orders
const statuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const payments = ["Paid", "Pending", "Failed"];
const methods = ["COD", "Manual"];

for (let i = 6; i <= 25; i++) {
  const orderId = `BTC-8472${90 + i}`;
  const status = statuses[i % statuses.length];
  const payStatus = status === "Delivered" || status === "Shipped" ? "Paid" : payments[i % payments.length];
  const method = methods[i % methods.length];
  
  initialOrders.push({
    id: orderId,
    customerName: `Customer ${i}`,
    customerEmail: `customer${i}@example.com`,
    customerPhone: `+91 98765 ${43200 + i}`,
    shippingAddress: {
      addressLine1: `${i * 4} Main Road`,
      addressLine2: "Central Zone",
      city: i % 2 === 0 ? "Delhi" : "Chennai",
      state: i % 2 === 0 ? "Delhi" : "Tamil Nadu",
      pincode: `6000${String(i).padStart(2, '0')}`
    },
    orderDate: `2026-08-${String(25 - (i % 15)).padStart(2, '0')} 12:${String(i * 2).padStart(2, '0')}`,
    items: [
      { id: `prod_00${(i % 5) + 1}`, name: `Botanical Care Product ${i}`, price: 399 + (i * 10), quantity: (i % 2) + 1 }
    ],
    subtotal: (399 + (i * 10)) * ((i % 2) + 1),
    discount: i % 3 === 0 ? 100 : 0,
    shippingFee: i % 2 === 0 ? 0 : 50,
    totalAmount: ((399 + (i * 10)) * ((i % 2) + 1)) - (i % 3 === 0 ? 100 : 0) + (i % 2 === 0 ? 0 : 50),
    paymentMethod: method,
    paymentStatus: payStatus,
    orderStatus: status
  });
}
