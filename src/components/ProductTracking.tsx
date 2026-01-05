import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Package, MapPin, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Product, SupplyChainEvent, loadProductsFromStorage, verifyBlockchainIntegrity } from '@/lib/blockchain';
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

export default function ProductTracking() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBlockchainValid, setIsBlockchainValid] = useState(true);

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

  useEffect(() => {
    if (selectedProduct) {
      const isValid = verifyBlockchainIntegrity(selectedProduct.events);
      setIsBlockchainValid(isValid);
    }
  }, [selectedProduct]);

  const filteredProducts = products.filter(product =>
    product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: SupplyChainEvent['status']) => {
    switch (status) {
      case 'manufactured': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warehoused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-transit': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'verified': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStakeholderIcon = (type: SupplyChainEvent['stakeholderType']) => {
    switch (type) {
      case 'manufacturer': return '🏭';
      case 'warehouse': return '🏢';
      case 'transporter': return '🚛';
      case 'retailer': return '🏪';
      case 'customer': return '👤';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Product Search & Tracking
          </CardTitle>
          <CardDescription>
            Search by Product ID, Name, or Batch Number to track its journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter Product ID, Name, or Batch Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product List */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {filteredProducts.length} product(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedProduct?.id === product.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{product.name}</span>
                        {product.authenticity ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">ID: {product.id}</p>
                      <p className="text-sm text-gray-600">Batch: {product.batchNumber}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{product.currentLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Package className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Stock: {product.currentStock}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(product.currentStatus)}>
                      {product.currentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products found matching your search</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Product Journey</span>
              {selectedProduct && (
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${isBlockchainValid ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm ${isBlockchainValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isBlockchainValid ? 'Blockchain Verified' : 'Blockchain Compromised'}
                  </span>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {selectedProduct ? 'Complete supply chain history' : 'Select a product to view its journey'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-6">
                {/* Product Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Manufacturer</p>
                    <p className="text-sm text-gray-600">{selectedProduct.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p className="text-sm text-gray-600">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Manufacturing Date</p>
                    <p className="text-sm text-gray-600">{selectedProduct.manufacturingDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Current Stock</p>
                    <p className="text-sm text-gray-600">{selectedProduct.currentStock} items</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Authenticity</p>
                    <div className="flex items-center gap-2">
                      {selectedProduct.authenticity ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">Suspicious</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Supply Chain Timeline
                  </h4>
                  <div className="space-y-4">
                    {selectedProduct.events.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getStatusColor(event.status)}`}>
                            {getStakeholderIcon(event.stakeholderType)}
                          </div>
                          {index < selectedProduct.events.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium capitalize">{event.status}</h5>
                            <Badge variant="outline" className="text-xs">
                              {formatTimestamp(event.timestamp)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {event.location} • {event.stakeholder}
                          </p>
                          {event.data.temperature && (
                            <div className="text-xs text-gray-500 space-x-4">
                              <span>Temp: {event.data.temperature}°C</span>
                              <span>Humidity: {event.data.humidity}%</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2 font-mono">
                            Hash: {event.hash}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Product Selected</p>
                <p className="text-sm">Choose a product from the search results to view its complete journey</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}