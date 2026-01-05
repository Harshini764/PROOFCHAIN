// Helper to get stakeholder type description
const getStakeholderTypeDescription = (type: SupplyChainEvent['stakeholderType']) => {
  switch (type) {
    case 'manufacturer': return 'Responsible for producing goods and ensuring quality.';
    case 'warehouse': return 'Stores products and manages inventory.';
    case 'transporter': return 'Handles logistics and delivery of products.';
    case 'retailer': return 'Sells products to end customers.';
    case 'customer': return 'Receives and uses the products.';
    default: return 'Supply chain participant.';
  }
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Factory,
  Warehouse,
  Truck,
  Store,
  Shield,
  Eye,
  FileText,
  TrendingUp,
  AlertCircle,
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Product, SupplyChainEvent, loadProductsFromStorage } from '@/lib/blockchain';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StakeholderData {
  id: string;
  name: string;
  type: SupplyChainEvent['stakeholderType'];
  products: Product[];
  totalEvents: number;
  recentActivity: SupplyChainEvent[];
  performance: {
    onTime: number;
    quality: number;
    compliance: number;
  };
}

// Hardcoded random stakeholders data
const hardcodedStakeholders: StakeholderData[] = [
  {
    id: 'hardcoded-warehouse-1',
    name: 'Global Warehouse Solutions',
    type: 'warehouse',
    products: [],
    totalEvents: 15,
    recentActivity: [],
    performance: { onTime: 92, quality: 88, compliance: 95 }
  },
  {
    id: 'hardcoded-warehouse-2',
    name: 'Secure Storage Inc.',
    type: 'warehouse',
    products: [],
    totalEvents: 18,
    recentActivity: [],
    performance: { onTime: 89, quality: 91, compliance: 93 }
  },
  {
    id: 'hardcoded-transporter-1',
    name: 'FastTrack Logistics',
    type: 'transporter',
    products: [],
    totalEvents: 20,
    recentActivity: [],
    performance: { onTime: 89, quality: 91, compliance: 87 }
  },
  {
    id: 'hardcoded-transporter-2',
    name: 'Swift Delivery Services',
    type: 'transporter',
    products: [],
    totalEvents: 22,
    recentActivity: [],
    performance: { onTime: 94, quality: 89, compliance: 92 }
  },
  {
    id: 'hardcoded-retailer-1',
    name: 'MegaMart Stores',
    type: 'retailer',
    products: [],
    totalEvents: 12,
    recentActivity: [],
    performance: { onTime: 94, quality: 96, compliance: 98 }
  },
  {
    id: 'hardcoded-retailer-2',
    name: 'Urban Marketplace',
    type: 'retailer',
    products: [],
    totalEvents: 16,
    recentActivity: [],
    performance: { onTime: 91, quality: 93, compliance: 95 }
  }
];

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
    currentStatus: 'in-transit',
    currentLocation: 'Highway Route 5',
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
    currentStatus: 'delivered',
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

export default function StakeholderPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stakeholders, setStakeholders] = useState<StakeholderData[]>([]);
  const [selectedRole, setSelectedRole] = useState<SupplyChainEvent['stakeholderType'] | 'stock'>('manufacturer');
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

        // Process stakeholder data
        const stakeholderMap = new Map<string, StakeholderData>();

        allProducts.forEach(product => {
          product.events.forEach(event => {
            const key = `${event.stakeholder}_${event.stakeholderType}`;

            if (!stakeholderMap.has(key)) {
              stakeholderMap.set(key, {
                id: key,
                name: event.stakeholder,
                type: event.stakeholderType,
                products: [],
                totalEvents: 0,
                recentActivity: [],
                performance: {
                  onTime: 85 + Math.random() * 15, // Random performance metrics for demo
                  quality: 80 + Math.random() * 20,
                  compliance: 90 + Math.random() * 10
                }
              });
            }

            const stakeholder = stakeholderMap.get(key)!;
            stakeholder.totalEvents++;
            stakeholder.recentActivity.push(event);

            if (!stakeholder.products.find(p => p.id === product.id)) {
              stakeholder.products.push(product);
            }
          });
        });

        // Add demo customers if none exist
        const hasCustomers = Array.from(stakeholderMap.values()).some(s => s.type === 'customer');
        if (!hasCustomers) {
          for (let i = 1; i <= 3; i++) {
            stakeholderMap.set(`Customer${i}_customer`, {
              id: `Customer${i}_customer`,
              name: `Customer ${i}`,
              type: 'customer',
              products: allProducts.filter((_, idx) => idx % 3 === (i - 1)),
              totalEvents: Math.floor(Math.random() * 5) + 1,
              recentActivity: [],
              performance: {
                onTime: 90,
                quality: 95,
                compliance: 100
              }
            });
          }
        }

        // Sort recent activity and limit to 5 items per stakeholder
        stakeholderMap.forEach(stakeholder => {
          stakeholder.recentActivity = stakeholder.recentActivity
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
        });

        setStakeholders([...Array.from(stakeholderMap.values()), ...hardcodedStakeholders]);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local storage
        const loadedProducts = loadProductsFromStorage();
        const allProducts = [...loadedProducts, ...hardcodedProducts];
        setProducts(allProducts);

        // Process stakeholder data with fallback
        const stakeholderMap = new Map<string, StakeholderData>();

        allProducts.forEach(product => {
          product.events.forEach(event => {
            const key = `${event.stakeholder}_${event.stakeholderType}`;

            if (!stakeholderMap.has(key)) {
              stakeholderMap.set(key, {
                id: key,
                name: event.stakeholder,
                type: event.stakeholderType,
                products: [],
                totalEvents: 0,
                recentActivity: [],
                performance: {
                  onTime: 85 + Math.random() * 15,
                  quality: 80 + Math.random() * 20,
                  compliance: 90 + Math.random() * 10
                }
              });
            }

            const stakeholder = stakeholderMap.get(key)!;
            stakeholder.totalEvents++;
            stakeholder.recentActivity.push(event);

            if (!stakeholder.products.find(p => p.id === product.id)) {
              stakeholder.products.push(product);
            }
          });
        });

        // Add demo customers if none exist
        const hasCustomers = Array.from(stakeholderMap.values()).some(s => s.type === 'customer');
        if (!hasCustomers) {
          for (let i = 1; i <= 3; i++) {
            stakeholderMap.set(`Customer${i}_customer`, {
              id: `Customer${i}_customer`,
              name: `Customer ${i}`,
              type: 'customer',
              products: allProducts.filter((_, idx) => idx % 3 === (i - 1)),
              totalEvents: Math.floor(Math.random() * 5) + 1,
              recentActivity: [],
              performance: {
                onTime: 90,
                quality: 95,
                compliance: 100
              }
            });
          }
        }

        // Sort recent activity and limit to 5 items per stakeholder
        stakeholderMap.forEach(stakeholder => {
          stakeholder.recentActivity = stakeholder.recentActivity
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
        });

        setStakeholders([...Array.from(stakeholderMap.values()), ...hardcodedStakeholders]);
      }
    };

    loadProductsFromFirestore();
  }, []);

  const getStakeholderIcon = (type: SupplyChainEvent['stakeholderType']) => {
    switch (type) {
      case 'manufacturer': return <Factory className="h-5 w-5" />;
      case 'warehouse': return <Warehouse className="h-5 w-5" />;
      case 'transporter': return <Truck className="h-5 w-5" />;
      case 'retailer': return <Store className="h-5 w-5" />;
      case 'customer': return <Users className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getStakeholderColor = (type: SupplyChainEvent['stakeholderType']) => {
    switch (type) {
      case 'manufacturer': return 'bg-blue-100 text-blue-800';
      case 'warehouse': return 'bg-yellow-100 text-yellow-800';
      case 'transporter': return 'bg-orange-100 text-orange-800';
      case 'retailer': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredStakeholders = stakeholders.filter(s => s.type === (selectedRole as SupplyChainEvent['stakeholderType']));

  const stakeholderTypes: { value: SupplyChainEvent['stakeholderType'] | 'stock'; label: string; icon: React.ReactNode }[] = [
    { value: 'manufacturer', label: 'Manufacturers', icon: <Factory className="h-4 w-4" /> },
    { value: 'warehouse', label: 'Warehouses', icon: <Warehouse className="h-4 w-4" /> },
    { value: 'transporter', label: 'Transporters', icon: <Truck className="h-4 w-4" /> },
    { value: 'retailer', label: 'Retailers', icon: <Store className="h-4 w-4" /> },
    { value: 'customer', label: 'Customers', icon: <Users className="h-4 w-4" /> },
    { value: 'stock', label: 'Stock Register', icon: <Package className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Stakeholder Management
          </CardTitle>
          <CardDescription>
            Manage and monitor all supply chain participants with role-based access control
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stock Register Segment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Register
          </CardTitle>
          <CardDescription>
            Overview of product stock levels and restocking needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Products in Stock</p>
                    <p className="text-2xl font-bold">
                      {products.filter(p => p.currentStock > 0).length}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Products to Restock</p>
                    <p className="text-2xl font-bold">
                      {products.filter(p => p.currentStock <= 5).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* List of products needing restock */}
          <div className="mt-6">
            <p className="text-lg font-semibold mb-2">Products Needing Restock (≤ 5 items)</p>
            {products.filter(p => p.currentStock <= 100).length === 0 ? (
              <p className="text-sm text-gray-500">No products need restocking at this time.</p>
            ) : (
              <ul className="list-disc ml-6 max-h-48 overflow-y-auto">
                {products.filter(p => p.currentStock <= 5).map(p => (
                  <li key={p.id}>
                    {p.name} - Current Stock: {p.currentStock} items
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Tabs */}
      <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as SupplyChainEvent['stakeholderType'] | 'stock')}>
        <TabsList className="grid w-full grid-cols-6">
          {stakeholderTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
              {type.icon}
              <span className="hidden sm:inline">{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {stakeholderTypes.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total {type.label}</p>
                      <p className="text-2xl font-bold">{filteredStakeholders.length}</p>
                    </div>
                    {type.icon}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Products</p>
                      <p className="text-2xl font-bold">
                        {filteredStakeholders.reduce((sum, s) => sum + s.products.length, 0)}
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold">
                        {filteredStakeholders.reduce((sum, s) => sum + s.totalEvents, 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                      <p className="text-2xl font-bold">
                        {filteredStakeholders.length > 0
                          ? Math.round(filteredStakeholders.reduce((sum, s) => sum + s.performance.compliance, 0) / filteredStakeholders.length)
                          : 0}%
                      </p>
                    </div>
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

                {/* Stakeholder List */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredStakeholders.map((stakeholder) => (
                    <Card key={stakeholder.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getStakeholderIcon(stakeholder.type)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
                              <Badge className={getStakeholderColor(stakeholder.type)}>
                                {stakeholder.type}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedStakeholder(stakeholder); setModalOpen(true); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">On-Time</p>
                            <p className={`text-lg font-bold ${getPerformanceColor(stakeholder.performance.onTime)}`}>
                              {stakeholder.performance.onTime.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quality</p>
                            <p className={`text-lg font-bold ${getPerformanceColor(stakeholder.performance.quality)}`}>
                              {stakeholder.performance.quality.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Compliance</p>
                            <p className={`text-lg font-bold ${getPerformanceColor(stakeholder.performance.compliance)}`}>
                              {stakeholder.performance.compliance.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Recent Activity</p>
                            <Badge variant="outline">{stakeholder.totalEvents} events</Badge>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {stakeholder.recentActivity.slice(0, 3).map((event) => (
                              <div key={event.id} className="text-xs p-2 bg-gray-50 rounded">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium capitalize">{event.status}</span>
                                  <span className="text-gray-500">
                                    {new Date(event.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-600">{event.location}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Alerts */}
                        {stakeholder.performance.compliance < 85 && (
                          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800">Low compliance score - requires attention</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredStakeholders.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      {stakeholderTypes.find(t => t.value === selectedRole)?.icon}
                      <p className="text-lg font-medium mb-2 mt-4">No {stakeholderTypes.find(t => t.value === selectedRole)?.label} Found</p>
                      <p className="text-sm">No stakeholders of this type are currently active in the supply chain</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
      </Tabs>
    {/* Stakeholder Details Modal */}
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Stakeholder Details</DialogTitle>
          <DialogDescription>
            Detailed information for {selectedStakeholder?.name}
          </DialogDescription>
        </DialogHeader>
        {selectedStakeholder && (
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500">{getStakeholderTypeDescription(selectedStakeholder.type)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getStakeholderIcon(selectedStakeholder.type)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-bold text-lg">{selectedStakeholder.name}</span>
                <Badge className={getStakeholderColor(selectedStakeholder.type)}>{selectedStakeholder.type}</Badge>
                <div className="text-xs text-gray-500 mt-1">Total Products: {selectedStakeholder.products.length}</div>
                <div className="text-xs text-gray-500">Compliance Status: {selectedStakeholder.performance.compliance >= 85 ? 'Compliant' : 'Needs Attention'}</div>
              </div>
            </div>
            <div>
              <p className="font-medium">Products:</p>
              <ul className="list-disc ml-6">
                {selectedStakeholder.products.map(p => (
                  <li key={p.id}>{p.name} <span className="text-xs text-gray-500">({p.currentStatus})</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Recent Activity:</p>
              <ul className="list-disc ml-6">
                {selectedStakeholder.recentActivity.map(e => (
                  <li key={e.id}>{e.status} at {e.location} on {new Date(e.timestamp).toLocaleString()}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Performance:</p>
              <ul className="ml-6">
                <li>On-Time: {selectedStakeholder.performance.onTime.toFixed(1)}%</li>
                <li>Quality: {selectedStakeholder.performance.quality.toFixed(1)}%</li>
                <li>Compliance: {selectedStakeholder.performance.compliance.toFixed(1)}%</li>
              </ul>
            </div>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
}