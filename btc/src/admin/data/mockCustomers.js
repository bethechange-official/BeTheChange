export const initialCustomers = [
  {
    id: "cust_001",
    name: "Ananya Sharma",
    email: "ananya.sharma@example.com",
    phone: "+91 98765 43210",
    totalOrders: 5,
    totalSpent: 4250,
    joinedDate: "2025-11-12",
    status: "Active"
  },
  {
    id: "cust_002",
    name: "Rohan Mehta",
    email: "rohan.mehta@example.com",
    phone: "+91 98123 45678",
    totalOrders: 3,
    totalSpent: 2190,
    joinedDate: "2025-12-05",
    status: "Active"
  },
  {
    id: "cust_003",
    name: "Priya Verma",
    email: "priya.verma@example.com",
    phone: "+91 99887 76655",
    totalOrders: 8,
    totalSpent: 7890,
    joinedDate: "2025-09-20",
    status: "Active"
  },
  {
    id: "cust_004",
    name: "Vikramaditya Singh",
    email: "vikram.singh@example.com",
    phone: "+91 97654 32109",
    totalOrders: 2,
    totalSpent: 1350,
    joinedDate: "2026-01-10",
    status: "Active"
  },
  {
    id: "cust_005",
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 91234 56789",
    totalOrders: 4,
    totalSpent: 3580,
    joinedDate: "2026-01-18",
    status: "Active"
  },
  {
    id: "cust_006",
    name: "Karan Johar",
    email: "karan.johar@example.com",
    phone: "+91 98450 12345",
    totalOrders: 1,
    totalSpent: 599,
    joinedDate: "2026-02-01",
    status: "Active"
  },
  {
    id: "cust_007",
    name: "Divya Agarwal",
    email: "divya.a@example.com",
    phone: "+91 99001 12233",
    totalOrders: 6,
    totalSpent: 5120,
    joinedDate: "2025-10-15",
    status: "Active"
  },
  {
    id: "cust_008",
    name: "Amitabh Patel",
    email: "amit.patel@example.com",
    phone: "+91 97788 99000",
    totalOrders: 2,
    totalSpent: 1890,
    joinedDate: "2026-02-10",
    status: "Inactive"
  }
];

// Generate 12 more customers up to 20
for (let i = 9; i <= 20; i++) {
  initialCustomers.push({
    id: `cust_${String(i).padStart(3, '0')}`,
    name: `Customer Name ${i}`,
    email: `customer${i}@example.com`,
    phone: `+91 98${i}00 ${i}543`,
    totalOrders: (i % 5) + 1,
    totalSpent: ((i % 5) + 1) * 850,
    joinedDate: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    status: i % 7 === 0 ? "Inactive" : "Active"
  });
}
