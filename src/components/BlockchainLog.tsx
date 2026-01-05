import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Search, 
  Link, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Hash,
  Database,
  Lock
} from 'lucide-react';
import {
  Product,
  SupplyChainEvent,
  loadProductsFromStorage,
  verifyBlockchainIntegrity
} from '@/lib/blockchain';
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

interface BlockchainBlock {
  blockNumber: number;
  events: SupplyChainEvent[];
  blockHash: string;
  previousBlockHash: string;
  timestamp: number;
  isValid: boolean;
}

export default function BlockchainLog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<BlockchainBlock | null>(null);
  const [overallIntegrity, setOverallIntegrity] = useState(true);

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

        // Create blockchain blocks from events
        const allEvents: SupplyChainEvent[] = [];
        allProducts.forEach(product => {
          allEvents.push(...product.events);
        });

        // Sort events by timestamp
        allEvents.sort((a, b) => a.timestamp - b.timestamp);

        // Group events into blocks (simulate blockchain structure)
        const blockSize = 5; // Events per block
        const createdBlocks: BlockchainBlock[] = [];

        for (let i = 0; i < allEvents.length; i += blockSize) {
          const blockEvents = allEvents.slice(i, i + blockSize);
          const blockNumber = Math.floor(i / blockSize) + 1;

          // Generate block hash based on events
          const blockData = JSON.stringify(blockEvents.map(e => e.hash));
          const previousBlockHash = createdBlocks.length > 0 ? createdBlocks[createdBlocks.length - 1].blockHash : '0000000000000000';
          const blockHash = generateBlockHash(blockData + previousBlockHash);

          // Verify block integrity
          const isValid = blockEvents.every(event => {
            const productEvents = allProducts.find(p => p.id === event.productId)?.events || [];
            return verifyBlockchainIntegrity(productEvents);
          });

          createdBlocks.push({
            blockNumber,
            events: blockEvents,
            blockHash,
            previousBlockHash,
            timestamp: blockEvents[0]?.timestamp || Date.now(),
            isValid
          });
        }

        setBlocks(createdBlocks);
        setOverallIntegrity(createdBlocks.every(block => block.isValid));
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local storage
        const loadedProducts = loadProductsFromStorage();
        setProducts(loadedProducts);

        // Create blockchain blocks from events
        const allEvents: SupplyChainEvent[] = [];
        loadedProducts.forEach(product => {
          allEvents.push(...product.events);
        });

        // Sort events by timestamp
        allEvents.sort((a, b) => a.timestamp - b.timestamp);

        // Group events into blocks (simulate blockchain structure)
        const blockSize = 5; // Events per block
        const createdBlocks: BlockchainBlock[] = [];

        for (let i = 0; i < allEvents.length; i += blockSize) {
          const blockEvents = allEvents.slice(i, i + blockSize);
          const blockNumber = Math.floor(i / blockSize) + 1;

          // Generate block hash based on events
          const blockData = JSON.stringify(blockEvents.map(e => e.hash));
          const previousBlockHash = createdBlocks.length > 0 ? createdBlocks[createdBlocks.length - 1].blockHash : '0000000000000000';
          const blockHash = generateBlockHash(blockData + previousBlockHash);

          // Verify block integrity
          const isValid = blockEvents.every(event => {
            const productEvents = loadedProducts.find(p => p.id === event.productId)?.events || [];
            return verifyBlockchainIntegrity(productEvents);
          });

          createdBlocks.push({
            blockNumber,
            events: blockEvents,
            blockHash,
            previousBlockHash,
            timestamp: blockEvents[0]?.timestamp || Date.now(),
            isValid
          });
        }

        setBlocks(createdBlocks);
        setOverallIntegrity(createdBlocks.every(block => block.isValid));
      }
    };

    loadProductsFromFirestore();
  }, []);

  const generateBlockHash = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  };

  const filteredBlocks = blocks.filter(block =>
    block.blockHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.events.some(event => 
      event.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.stakeholder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getEventStatusColor = (status: SupplyChainEvent['status']) => {
    switch (status) {
      case 'manufactured': return 'bg-blue-100 text-blue-800';
      case 'warehoused': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateHash = (hash: string, length: number = 12) => {
    return `${hash.substring(0, length)}...`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Transaction Log
            {overallIntegrity ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            Immutable record of all supply chain transactions with cryptographic verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{blocks.length} Blocks</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {blocks.reduce((sum, block) => sum + block.events.length, 0)} Transactions
                </span>
              </div>
            </div>
            <Badge variant={overallIntegrity ? "default" : "destructive"}>
              {overallIntegrity ? "Blockchain Verified" : "Integrity Compromised"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by block hash, product ID, stakeholder, or location..."
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
        {/* Block List */}
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Blocks</CardTitle>
            <CardDescription>
              {filteredBlocks.length} block(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredBlocks.map((block) => (
                <div
                  key={block.blockNumber}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedBlock?.blockNumber === block.blockNumber ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedBlock(block)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Block #{block.blockNumber}</span>
                      {block.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <Badge variant="outline">
                      {block.events.length} events
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(block.timestamp)}</span>
                    </div>
                    <div className="font-mono text-xs">
                      Hash: {truncateHash(block.blockHash)}
                    </div>
                    {block.previousBlockHash !== '0000000000000000' && (
                      <div className="font-mono text-xs text-gray-500">
                        Prev: {truncateHash(block.previousBlockHash)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredBlocks.length === 0 && searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No blocks found matching your search</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Block Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Block Details</span>
              {selectedBlock && (
                <div className="flex items-center gap-2">
                  {selectedBlock.isValid ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Valid</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Invalid</span>
                    </>
                  )}
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {selectedBlock ? 'Block transaction details' : 'Select a block to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedBlock ? (
              <div className="space-y-6">
                {/* Block Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Block Number</p>
                    <p className="text-sm text-gray-600">#{selectedBlock.blockNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Timestamp</p>
                    <p className="text-sm text-gray-600">{formatTimestamp(selectedBlock.timestamp)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-700">Block Hash</p>
                    <p className="text-xs font-mono text-gray-600 break-all">{selectedBlock.blockHash}</p>
                  </div>
                  {selectedBlock.previousBlockHash !== '0000000000000000' && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-700">Previous Block Hash</p>
                      <p className="text-xs font-mono text-gray-600 break-all">{selectedBlock.previousBlockHash}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Block Transactions */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Transactions ({selectedBlock.events.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedBlock.events.map((event, index) => (
                      <div key={event.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <Badge className={getEventStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Product:</span>
                            <span className="ml-1 font-medium">{event.productId}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stakeholder:</span>
                            <span className="ml-1">{event.stakeholder}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Location:</span>
                            <span className="ml-1">{event.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs font-mono text-gray-500 break-all">
                          Hash: {event.hash}
                        </div>
                        
                        {event.data.temperature && (
                          <div className="mt-2 text-xs text-gray-600">
                            Temp: {event.data.temperature}°C, Humidity: {event.data.humidity}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Block Selected</p>
                <p className="text-sm">Choose a block from the list to view its transaction details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}