import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { QrCode, Scan, MapPin, Thermometer, Droplets, Plus } from 'lucide-react';
import { 
  Product, 
  SupplyChainEvent, 
  loadProductsFromStorage, 
  updateProductInStorage, 
  createSupplyChainEvent 
} from '@/lib/blockchain';

export default function QRScanner() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStatus, setNewStatus] = useState<SupplyChainEvent['status']>('warehoused');
  const [location, setLocation] = useState('');
  const [stakeholder, setStakeholder] = useState('');
  const [stakeholderType, setStakeholderType] = useState<SupplyChainEvent['stakeholderType']>('warehouse');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [notes, setNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const loadedProducts = loadProductsFromStorage();
    setProducts(loadedProducts);
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId, products]);

  const simulateQRScan = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      if (products.length > 0) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        setSelectedProductId(randomProduct.id);
        toast.success(`QR Code scanned: ${randomProduct.name}`);
      }
      setIsScanning(false);
    }, 2000);
  };

  const updateProductStatus = () => {
    if (!selectedProduct || !location || !stakeholder) {
      toast.error('Please fill in all required fields');
      return;
    }

    const lastEvent = selectedProduct.events[selectedProduct.events.length - 1];
    const previousHash = lastEvent ? lastEvent.hash : '00000000';

    const additionalData: SupplyChainEvent['data'] = {
      notes: notes || undefined,
    };

    if (temperature) {
      additionalData.temperature = parseFloat(temperature);
    }
    if (humidity) {
      additionalData.humidity = parseFloat(humidity);
    }

    // Add random coordinates for demo
    additionalData.coordinates = {
      lat: 40.7128 + (Math.random() - 0.5) * 20,
      lng: -74.0060 + (Math.random() - 0.5) * 20
    };

    const newEvent = createSupplyChainEvent(
      selectedProduct.id,
      newStatus,
      location,
      stakeholder,
      stakeholderType,
      previousHash,
      additionalData
    );

    const updatedProduct: Product = {
      ...selectedProduct,
      currentStatus: newStatus,
      currentLocation: location,
      events: [...selectedProduct.events, newEvent]
    };

    updateProductInStorage(updatedProduct);
    
    // Update local state
    const updatedProducts = products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(updatedProducts);
    setSelectedProduct(updatedProduct);

    // Reset form
    setLocation('');
    setStakeholder('');
    setTemperature('');
    setHumidity('');
    setNotes('');

    toast.success(`Product status updated to ${newStatus}`);
  };

  const getStatusColor = (status: SupplyChainEvent['status']) => {
    switch (status) {
      case 'manufactured': return 'bg-blue-100 text-blue-800';
      case 'warehoused': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* QR Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan product QR codes to update supply chain status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product or scan QR code" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={simulateQRScan} 
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <Scan className="h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Simulate QR Scan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              {selectedProduct ? 'Current product details' : 'No product selected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Product ID</p>
                    <p className="text-sm text-gray-600">{selectedProduct.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-600">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Batch Number</p>
                    <p className="text-sm text-gray-600">{selectedProduct.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p className="text-sm text-gray-600">{selectedProduct.category}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Current Status</p>
                    <Badge className={getStatusColor(selectedProduct.currentStatus)}>
                      {selectedProduct.currentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {selectedProduct.currentLocation}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recent Events</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedProduct.events.slice(-3).reverse().map((event) => (
                      <div key={event.id} className="text-xs p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{event.status}</span>
                          <span className="text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{event.location} • {event.stakeholder}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Product Selected</p>
                <p className="text-sm">Scan a QR code or select a product to view details</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Update Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Update Status
            </CardTitle>
            <CardDescription>
              Add a new checkpoint to the supply chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">New Status</label>
                    <Select value={newStatus} onValueChange={(value: SupplyChainEvent['status']) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufactured">Manufactured</SelectItem>
                        <SelectItem value="warehoused">Warehoused</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Stakeholder Type</label>
                    <Select value={stakeholderType} onValueChange={(value: SupplyChainEvent['stakeholderType']) => setStakeholderType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="transporter">Transporter</SelectItem>
                        <SelectItem value="retailer">Retailer</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Location *</label>
                  <Input
                    placeholder="Enter current location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Stakeholder Name *</label>
                  <Input
                    placeholder="Enter stakeholder/company name"
                    value={stakeholder}
                    onChange={(e) => setStakeholder(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      Temperature (°C)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 22"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Droplets className="h-4 w-4" />
                      Humidity (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 45"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    placeholder="Additional notes or observations"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={updateProductStatus} 
                  className="w-full"
                  disabled={!location || !stakeholder}
                >
                  Update Supply Chain Status
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Select a Product</p>
                <p className="text-sm">Choose a product to update its supply chain status</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}