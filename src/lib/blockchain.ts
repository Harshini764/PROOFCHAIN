// Blockchain simulation utilities for supply chain tracking

export interface SupplyChainEvent {
  id: string;
  productId: string;
  timestamp: number;
  location: string;
  status: 'manufactured' | 'warehoused' | 'in-transit' | 'delivered' | 'verified';
  stakeholder: string;
  stakeholderType: 'manufacturer' | 'warehouse' | 'transporter' | 'retailer' | 'customer';
  hash: string;
  previousHash: string;
  data: {
    temperature?: number;
    humidity?: number;
    coordinates?: { lat: number; lng: number };
    notes?: string;
    stockChange?: number; // +ve for stock in, -ve for stock out
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate?: string;
  authenticity: boolean;
  currentStatus: SupplyChainEvent['status'];
  currentLocation: string;
  currentStock: number;
  events: SupplyChainEvent[];
}

// Simple hash function for blockchain simulation
export function generateHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Create a new supply chain event
export function createSupplyChainEvent(
  productId: string,
  status: SupplyChainEvent['status'],
  location: string,
  stakeholder: string,
  stakeholderType: SupplyChainEvent['stakeholderType'],
  previousHash: string = '00000000',
  additionalData: SupplyChainEvent['data'] = {}
): SupplyChainEvent {
  const timestamp = Date.now();
  const eventData = JSON.stringify({
    productId,
    timestamp,
    location,
    status,
    stakeholder,
    stakeholderType,
    ...additionalData
  });
  
  const hash = generateHash(eventData + previousHash);
  
  return {
    id: `event_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    productId,
    timestamp,
    location,
    status,
    stakeholder,
    stakeholderType,
    hash,
    previousHash,
    data: additionalData
  };
}

// Verify blockchain integrity
export function verifyBlockchainIntegrity(events: SupplyChainEvent[]): boolean {
  if (events.length === 0) return true;
  
  for (let i = 1; i < events.length; i++) {
    const currentEvent = events[i];
    const previousEvent = events[i - 1];
    
    if (currentEvent.previousHash !== previousEvent.hash) {
      return false;
    }
    
    // Verify current event hash
    const eventData = JSON.stringify({
      productId: currentEvent.productId,
      timestamp: currentEvent.timestamp,
      location: currentEvent.location,
      status: currentEvent.status,
      stakeholder: currentEvent.stakeholder,
      stakeholderType: currentEvent.stakeholderType,
      ...currentEvent.data
    });
    
    const expectedHash = generateHash(eventData + currentEvent.previousHash);
    if (currentEvent.hash !== expectedHash) {
      return false;
    }
  }
  
  return true;
}

// Generate sample products for demo
export function generateSampleProducts(): Product[] {
  const products: Product[] = [];
  const categories = ['Electronics', 'Food & Beverage', 'Pharmaceuticals', 'Clothing', 'Home & Garden'];
  const manufacturers = ['TechCorp', 'FreshFoods Inc', 'PharmaSafe', 'StyleWear', 'HomeGoods Ltd'];
  
  for (let i = 1; i <= 10; i++) {
    const categoryIndex = (i - 1) % categories.length;
    const category = categories[categoryIndex];
    const manufacturer = manufacturers[categoryIndex];
    
    const manufacturingDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const expiryDate = category === 'Food & Beverage' || category === 'Pharmaceuticals' 
      ? new Date(manufacturingDate.getTime() + 365 * 24 * 60 * 60 * 1000) 
      : undefined;
    
    const product: Product = {
      id: `PROD_${i.toString().padStart(4, '0')}`,
      name: `${category} Product ${i}`,
      category,
      manufacturer,
      batchNumber: `BATCH_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      manufacturingDate: manufacturingDate.toISOString().split('T')[0],
      expiryDate: expiryDate?.toISOString().split('T')[0],
      authenticity: Math.random() > 0.1, // 90% authentic products
      currentStatus: 'manufactured',
      currentLocation: `${manufacturer} Factory`,
      currentStock: 0, // Will be calculated after events
      events: []
    };
    
    // Create initial manufacturing event
    const initialStock = Math.floor(Math.random() * 200) + 50; // 50-250 items
    const manufacturingEvent = createSupplyChainEvent(
      product.id,
      'manufactured',
      product.currentLocation,
      manufacturer,
      'manufacturer',
      '00000000',
      {
        temperature: 22,
        humidity: 45,
        coordinates: { lat: 40.7128 + Math.random() * 10, lng: -74.0060 + Math.random() * 10 },
        stockChange: initialStock
      }
    );
    
    product.events.push(manufacturingEvent);
    
    // Simulate some products further along in the supply chain
    if (Math.random() > 0.3) {
      const warehouseEvent = createSupplyChainEvent(
        product.id,
        'warehoused',
        'Central Warehouse',
        'WareHouse Co',
        'warehouse',
        manufacturingEvent.hash,
        {
          temperature: 20,
          humidity: 50,
          coordinates: { lat: 40.7580 + Math.random() * 5, lng: -73.9855 + Math.random() * 5 }
        }
      );
      product.events.push(warehouseEvent);
      product.currentStatus = 'warehoused';
      product.currentLocation = 'Central Warehouse';
      
      if (Math.random() > 0.5) {
        const transitEvent = createSupplyChainEvent(
          product.id,
          'in-transit',
          'Highway 101',
          'FastShip Logistics',
          'transporter',
          warehouseEvent.hash,
          {
            temperature: 18,
            humidity: 55,
            coordinates: { lat: 40.7489 + Math.random() * 3, lng: -73.9680 + Math.random() * 3 }
          }
        );
        product.events.push(transitEvent);
        product.currentStatus = 'in-transit';
        product.currentLocation = 'Highway 101';
        
        if (Math.random() > 0.7) {
          const soldQuantity = Math.floor(Math.random() * initialStock) + 1; // 1 to initialStock items sold, ensuring stock > 0
          const deliveredEvent = createSupplyChainEvent(
            product.id,
            'delivered',
            'Walmart Store #1234',
            'Walmart',
            'retailer',
            transitEvent.hash,
            {
              temperature: 21,
              humidity: 48,
              coordinates: { lat: 40.7831 + Math.random() * 2, lng: -73.9712 + Math.random() * 2 },
              stockChange: -soldQuantity
            }
          );
          product.events.push(deliveredEvent);
          product.currentStatus = 'delivered';
          product.currentLocation = 'Walmart Store #1234';
        }
      }
    }

    // Calculate current stock from events
    product.currentStock = product.events.reduce((sum, e) => sum + (e.data.stockChange || 0), 0);

    products.push(product);
  }
  
  return products;
}

// Storage utilities
export function saveProductsToStorage(products: Product[]): void {
  localStorage.setItem('supply_chain_products_v2', JSON.stringify(products));
}

export function loadProductsFromStorage(): Product[] {
  const stored = localStorage.getItem('supply_chain_products_v2');
  if (stored) {
    const products = JSON.parse(stored);
    // Recalculate currentStock to ensure it's accurate
    products.forEach((product: Product) => {
      product.currentStock = product.events.reduce((sum, e) => sum + (e.data.stockChange || 0), 0);
    });
    return products;
  }
  const sampleProducts = generateSampleProducts();
  saveProductsToStorage(sampleProducts);
  return sampleProducts;
}

export function updateProductInStorage(updatedProduct: Product): void {
  const products = loadProductsFromStorage();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProductsToStorage(products);
  }
}