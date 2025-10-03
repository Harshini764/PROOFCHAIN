import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { loadProductsFromStorage, Product } from "@/lib/blockchain";

const AnalyticsDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(loadProductsFromStorage());
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
