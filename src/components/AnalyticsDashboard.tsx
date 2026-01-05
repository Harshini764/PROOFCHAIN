import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { loadProductsFromStorage, Product } from "@/lib/blockchain";
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Hardcoded fake products data
const hardcodedProducts: Product[] = [
  {
    id: 'fake-product-1',
    name: 'Eco-Friendly Water Bottle',
    category: 'Home & Garden',
    manufacturer: 'GreenGoods Ltd',
    batchNumber: 'BATCH_FAKE001',
    manufacturingDate: '2023-10-01',
    expiryDate: undefined,
    authenticity: true,
    currentStatus: 'delivered',
    currentLocation: 'MegaMart Stores',
    currentStock: 150,
    events: [
      {
        id: 'event-fake-1',
        productId: 'fake-product-1',
        timestamp: Date.now() - 86400000,
        location: 'Warehouse A',
        status: 'warehoused',
        stakeholder: 'Global Warehouse Solutions',
        stakeholderType: 'warehouse',
        hash: 'fakehash1',
        previousHash: '00000000',
        data: { notes: 'Product stored safely.' }
      },
      {
        id: 'event-fake-2',
        productId: 'fake-product-1',
        timestamp: Date.now() - 3600000,
        location: 'Highway Route 5',
        status: 'in-transit',
        stakeholder: 'FastTrack Logistics',
        stakeholderType: 'transporter',
        hash: 'fakehash2',
        previousHash: 'fakehash1',
        data: { notes: 'En route to retailer.' }
      },
      {
        id: 'event-fake-13',
        productId: 'fake-product-1',
        timestamp: Date.now() - 1800000,
        location: 'MegaMart Stores',
        status: 'delivered',
        stakeholder: 'MegaMart Stores',
        stakeholderType: 'retailer',
        hash: 'fakehash13',
        previousHash: 'fakehash2',
        data: { notes: 'Delivered to retailer.' }
      }
    ]
  },
  {
    id: 'fake-product-2',
    name: 'Organic Coffee Beans',
    category: 'Food & Beverage',
    manufacturer: 'FreshFoods Inc',
    batchNumber: 'BATCH_FAKE002',
    manufacturingDate: '2023-09-15',
    expiryDate: '2024-09-15',
    authenticity: true,
    currentStatus: 'verified',
    currentLocation: 'MegaMart Stores',
    currentStock: 75,
    events: [
      {
        id: 'event-fake-3',
        productId: 'fake-product-2',
        timestamp: Date.now() - 172800000,
        location: 'Warehouse B',
        status: 'warehoused',
        stakeholder: 'Secure Storage Inc.',
        stakeholderType: 'warehouse',
        hash: 'fakehash3',
        previousHash: '00000000',
        data: { notes: 'Quality checked and stored.' }
      },
      {
        id: 'event-fake-4',
        productId: 'fake-product-2',
        timestamp: Date.now() - 7200000,
        location: 'MegaMart Stores',
        status: 'delivered',
        stakeholder: 'Swift Delivery Services',
        stakeholderType: 'transporter',
        hash: 'fakehash4',
        previousHash: 'fakehash3',
        data: { notes: 'Delivered successfully.' }
      },
      {
        id: 'event-fake-14',
        productId: 'fake-product-2',
        timestamp: Date.now() - 3600000,
        location: 'MegaMart Stores',
        status: 'verified',
        stakeholder: 'HealthMart Pharmacy',
        stakeholderType: 'retailer',
        hash: 'fakehash14',
        previousHash: 'fakehash4',
        data: { notes: 'Verified by retailer.' }
      }
    ]
  },
  {
    id: 'fake-product-3',
    name: 'Wireless Earbuds',
    category: 'Electronics',
    manufacturer: 'TechCorp',
    batchNumber: 'BATCH_FAKE003',
    manufacturingDate: '2023-08-20',
    expiryDate: undefined,
    authenticity: true,
    currentStatus: 'manufactured',
    currentLocation: 'Factory Alpha',
    currentStock: 200,
    events: [
      {
        id: 'event-fake-5',
        productId: 'fake-product-3',
        timestamp: Date.now() - 259200000,
        location: 'Factory Alpha',
        status: 'manufactured',
        stakeholder: 'Tech Manufacturers Inc.',
        stakeholderType: 'manufacturer',
        hash: 'fakehash5',
        previousHash: '00000000',
        data: { notes: 'Batch produced and quality tested.' }
      }
    ]
  },
  {
    id: 'fake-product-4',
    name: 'Smartphone Case',
    category: 'Electronics',
    manufacturer: 'TechCorp',
    batchNumber: 'BATCH_FAKE004',
    manufacturingDate: '2023-09-01',
    expiryDate: undefined,
    authenticity: true,
    currentStatus: 'warehoused',
    currentLocation: 'Central Warehouse',
    currentStock: 300,
    events: [
      {
        id: 'event-fake-6',
        productId: 'fake-product-4',
        timestamp: Date.now() - 604800000,
        location: 'TechCorp Factory',
        status: 'manufactured',
        stakeholder: 'Tech Manufacturers Inc.',
        stakeholderType: 'manufacturer',
        hash: 'fakehash6',
        previousHash: '00000000',
        data: { notes: 'Produced and packaged.' }
      },
      {
        id: 'event-fake-7',
        productId: 'fake-product-4',
        timestamp: Date.now() - 86400000,
        location: 'Central Warehouse',
        status: 'warehoused',
        stakeholder: 'Global Warehouse Solutions',
        stakeholderType: 'warehouse',
        hash: 'fakehash7',
        previousHash: 'fakehash6',
        data: { notes: 'Received and stored.' }
      }
    ]
  },
  {
    id: 'fake-product-5',
    name: 'Vitamin C Tablets',
    category: 'Pharmaceuticals',
    manufacturer: 'PharmaSafe',
    batchNumber: 'BATCH_FAKE005',
    manufacturingDate: '2023-07-15',
    expiryDate: '2025-07-15',
    authenticity: true,
    currentStatus: 'verified',
    currentLocation: 'Pharmacy Outlet',
    currentStock: 50,
    events: [
      {
        id: 'event-fake-8',
        productId: 'fake-product-5',
        timestamp: Date.now() - 1209600000,
        location: 'PharmaSafe Lab',
        status: 'manufactured',
        stakeholder: 'PharmaSafe',
        stakeholderType: 'manufacturer',
        hash: 'fakehash8',
        previousHash: '00000000',
        data: { notes: 'Manufactured and tested.' }
      },
      {
        id: 'event-fake-9',
        productId: 'fake-product-5',
        timestamp: Date.now() - 86400000,
        location: 'Pharmacy Outlet',
        status: 'verified',
        stakeholder: 'HealthMart Pharmacy',
        stakeholderType: 'retailer',
        hash: 'fakehash9',
        previousHash: 'fakehash8',
        data: { notes: 'Verified and sold.' }
      }
    ]
  },
  {
    id: 'fake-product-6',
    name: 'Counterfeit Smartphone',
    category: 'Electronics',
    manufacturer: 'Unknown',
    batchNumber: 'BATCH_FAKE006',
    manufacturingDate: '2023-06-01',
    expiryDate: undefined,
    authenticity: false,
    currentStatus: 'manufactured',
    currentLocation: 'Unknown Warehouse',
    currentStock: 10,
    events: [
      {
        id: 'event-fake-10',
        productId: 'fake-product-6',
        timestamp: Date.now() - 2592000000,
        location: 'Unknown Factory',
        status: 'manufactured',
        stakeholder: 'Unknown Manufacturer',
        stakeholderType: 'manufacturer',
        hash: 'fakehash10',
        previousHash: '00000000',
        data: { notes: 'Suspicious manufacturing.' }
      }
    ]
  },
  {
    id: 'fake-product-7',
    name: 'Expired Milk',
    category: 'Food & Beverage',
    manufacturer: 'DairyCorp',
    batchNumber: 'BATCH_FAKE007',
    manufacturingDate: '2023-01-01',
    expiryDate: '2023-12-31',
    authenticity: false,
    currentStatus: 'warehoused',
    currentLocation: 'Expired Goods Warehouse',
    currentStock: 5,
    events: [
      {
        id: 'event-fake-11',
        productId: 'fake-product-7',
        timestamp: Date.now() - 31536000000,
        location: 'DairyCorp Factory',
        status: 'manufactured',
        stakeholder: 'DairyCorp',
        stakeholderType: 'manufacturer',
        hash: 'fakehash11',
        previousHash: '00000000',
        data: { notes: 'Past expiry date.' }
      },
      {
        id: 'event-fake-12',
        productId: 'fake-product-7',
        timestamp: Date.now() - 86400000,
        location: 'Expired Goods Warehouse',
        status: 'warehoused',
        stakeholder: 'Expired Storage Inc.',
        stakeholderType: 'warehouse',
        hash: 'fakehash12',
        previousHash: 'fakehash11',
        data: { notes: 'Stored despite expiry.' }
      }
    ]
  }
];

const AnalyticsDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProductsFromFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
          productsData.push(doc.data() as Product);
        });
        const allProducts = [...productsData, ...hardcodedProducts];
        setProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local storage
        const loadedProducts = loadProductsFromStorage();
        const allProducts = [...loadedProducts, ...hardcodedProducts];
        setProducts(allProducts);
      }
    };

    loadProductsFromFirestore();
  }, []);

  // Aggregate product status counts for chart
  const statusCounts = [
    { status: "Manufactured", count: products.filter(p => p.currentStatus === "manufactured").length },
    { status: "Warehoused", count: products.filter(p => p.currentStatus === "warehoused").length },
    { status: "In-Transit", count: products.filter(p => p.currentStatus === "in-transit").length },
    { status: "Delivered", count: products.filter(p => p.currentStatus === "delivered").length },
    { status: "Verified", count: products.filter(p => p.currentStatus === "verified").length },
  ];

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stat Cards */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold">Products Tracked</h3>
          <p className="text-3xl">{products.length}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold">Products Authenticated</h3>
          <p className="text-3xl">{products.filter(p => p.authenticity).length}</p>
        </div>
        {/* Chart Section */}
        <div className="bg-gray-100 p-4 rounded col-span-2">
          <h3 className="text-lg font-semibold mb-2">Tracking Activity (Chart)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
