import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: ,
  authDomain: ,
  projectId: ,
  storageBucket: ,
  messagingSenderId: ,
  appId: ,
  measurementId: 
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence).catch(console.error);

export const seedProducts = async () => {
  const productsRef = collection(db, 'products');
  const querySnapshot = await getDocs(productsRef);
  if (querySnapshot.empty) {
    const sampleProducts = [
      {
        id: 'prod-001',
        name: 'iPhone 15 Pro Max',
        batchNumber: 'IPH15PM-2024-001',
        manufacturer: 'Apple Inc.',
        category: 'electronics',
        manufacturingDate: '2024-01-15',
        currentLocation: 'Apple Factory, Cupertino, CA',
        currentStock: 150,
        currentStatus: 'manufactured' as const,
        authenticity: true,
        events: [
          {
            id: 'evt-001-1',
            status: 'manufactured' as const,
            timestamp: Date.now() - 86400000 * 7, // 7 days ago
            location: 'Apple Factory, Cupertino, CA',
            stakeholder: 'Apple Manufacturing',
            stakeholderType: 'manufacturer' as const,
            data: { temperature: 22, humidity: 45 },
            hash: 'hash-001-1'
          }
        ]
      },
      {
        id: 'prod-002',
        name: 'COVID-19 Vaccine Pfizer',
        batchNumber: 'PFZ-COVID-2024-045',
        manufacturer: 'Pfizer Inc.',
        category: 'pharmaceuticals',
        manufacturingDate: '2024-02-01',
        currentLocation: 'Pfizer Distribution Center, New York',
        currentStock: 50000,
        expiryDate: '2025-02-01',
        currentStatus: 'warehoused' as const,
        authenticity: true,
        events: [
          {
            id: 'evt-002-1',
            status: 'manufactured' as const,
            timestamp: Date.now() - 86400000 * 14,
            location: 'Pfizer Plant, Kalamazoo, MI',
            stakeholder: 'Pfizer Manufacturing',
            stakeholderType: 'manufacturer' as const,
            data: { temperature: 4, humidity: 30 },
            hash: 'hash-002-1'
          },
          {
            id: 'evt-002-2',
            status: 'warehoused' as const,
            timestamp: Date.now() - 86400000 * 7,
            location: 'Pfizer Distribution Center, New York',
            stakeholder: 'Pfizer Logistics',
            stakeholderType: 'warehouse' as const,
            data: { temperature: 2, humidity: 25 },
            hash: 'hash-002-2'
          }
        ]
      },
      {
        id: 'prod-003',
        name: 'Organic Bananas',
        batchNumber: 'ORG-BAN-2024-089',
        manufacturer: 'Tropical Farms Co.',
        category: 'food',
        manufacturingDate: '2024-03-01',
        currentLocation: 'Walmart Supercenter, Chicago',
        currentStock: 200,
        expiryDate: '2024-03-15',
        currentStatus: 'delivered' as const,
        authenticity: true,
        events: [
          {
            id: 'evt-003-1',
            status: 'manufactured' as const,
            timestamp: Date.now() - 86400000 * 10,
            location: 'Tropical Farms, Costa Rica',
            stakeholder: 'Tropical Farms',
            stakeholderType: 'manufacturer' as const,
            data: { temperature: 28, humidity: 80 },
            hash: 'hash-003-1'
          },
          {
            id: 'evt-003-2',
            status: 'in-transit' as const,
            timestamp: Date.now() - 86400000 * 5,
            location: 'Shipping Container, Atlantic Ocean',
            stakeholder: 'Global Shipping Lines',
            stakeholderType: 'transporter' as const,
            data: { temperature: 15, humidity: 70 },
            hash: 'hash-003-2'
          },
          {
            id: 'evt-003-3',
            status: 'delivered' as const,
            timestamp: Date.now() - 86400000 * 1,
            location: 'Walmart Supercenter, Chicago',
            stakeholder: 'Walmart Retail',
            stakeholderType: 'retailer' as const,
            data: { temperature: 20, humidity: 50 },
            hash: 'hash-003-3'
          },
          {
            id: 'evt-003-4',
            status: 'verified' as const,
            timestamp: Date.now() - 86400000 * 0.5, // 12 hours ago
            location: 'Home Delivery, Chicago',
            stakeholder: 'John Doe',
            stakeholderType: 'customer' as const,
            data: { temperature: 22, humidity: 45 },
            hash: 'hash-003-4'
          }
        ]
      },
      {
        id: 'prod-004',
        name: 'Nike Air Max 270',
        batchNumber: 'NIK-AM270-2024-112',
        manufacturer: 'Nike Inc.',
        category: 'clothing',
        manufacturingDate: '2024-01-20',
        currentLocation: 'Nike Warehouse, Portland, OR',
        currentStock: 75,
        currentStatus: 'warehoused' as const,
        authenticity: true,
        events: [
          {
            id: 'evt-004-1',
            status: 'manufactured' as const,
            timestamp: Date.now() - 86400000 * 12,
            location: 'Nike Factory, Vietnam',
            stakeholder: 'Nike Manufacturing',
            stakeholderType: 'manufacturer' as const,
            data: { temperature: 25, humidity: 60 },
            hash: 'hash-004-1'
          },
          {
            id: 'evt-004-2',
            status: 'warehoused' as const,
            timestamp: Date.now() - 86400000 * 3,
            location: 'Nike Warehouse, Portland, OR',
            stakeholder: 'Nike Distribution',
            stakeholderType: 'warehouse' as const,
            data: { temperature: 18, humidity: 40 },
            hash: 'hash-004-2'
          }
        ]
      },
      {
        id: 'prod-005',
        name: 'Tesla Model 3 Battery Pack',
        batchNumber: 'TSLA-M3-BAT-2024-078',
        manufacturer: 'Tesla Inc.',
        category: 'automotive',
        manufacturingDate: '2024-02-10',
        currentLocation: 'Tesla Gigafactory, Austin, TX',
        currentStock: 25,
        currentStatus: 'manufactured' as const,
        authenticity: true,
        events: [
          {
            id: 'evt-005-1',
            status: 'manufactured' as const,
            timestamp: Date.now() - 86400000 * 8,
            location: 'Tesla Gigafactory, Austin, TX',
            stakeholder: 'Tesla Manufacturing',
            stakeholderType: 'manufacturer' as const,
            data: { temperature: 22, humidity: 35 },
            hash: 'hash-005-1'
          }
        ]
      },
      {
        id: 'prod-006',
        name: 'Samsung Galaxy S24 Ultra',
        batchNumber: 'SAM-GS24U-2024-056',
        manufacturer: 'Samsung Electronics',
        category: 'electronics',
        manufacturingDate: '2024-01-25',
        currentLocation: 'Samsung Distribution Center, Seoul',
        currentStock: 120,
        currentStatus: 'in-transit' as const,
        authenticity: true,
        events: [
          {
            id: 'evt-006-1',
            status: 'manufactured' as const,
            timestamp: Date.now() - 86400000 * 6,
            location: 'Samsung Factory, South Korea',
            stakeholder: 'Samsung Manufacturing',
            stakeholderType: 'manufacturer' as const,
            data: { temperature: 23, humidity: 50 },
            hash: 'hash-006-1'
          },
          {
            id: 'evt-006-2',
            status: 'in-transit' as const,
            timestamp: Date.now() - 86400000 * 2,
            location: 'Cargo Ship, Pacific Ocean',
            stakeholder: 'Samsung Logistics',
            stakeholderType: 'transporter' as const,
            data: { temperature: 18, humidity: 75 },
            hash: 'hash-006-2'
          }
        ]
      },
      {
        id: 'prod-007',
        name: 'Amoxicillin 500mg Capsules',
        batchNumber: 'AMOX-500-2024-034',
        manufacturer: 'Johnson & Johnson',
        category: 'pharmaceuticals',
        manufacturingDate: '2024-02-15',
        currentLocation: 'CVS Pharmacy, Boston',
        currentStock: 1000,
        expiryDate: '2026-02-15',
        currentStatus: 'delivered' as const,
        authenticity: true,
        events: [
          {
            id: 'evt-007-1',
            status: 'manufactured' as const,
            timestamp: Date.now() - 86400000 * 20,
            location: 'J&J Plant, New Jersey',
            stakeholder: 'Johnson & Johnson',
            stakeholderType: 'manufacturer' as const,
            data: { temperature: 20, humidity: 40 },
            hash: 'hash-007-1'
          },
          {
            id: 'evt-007-2',
            status: 'warehoused' as const,
            timestamp: Date.now() - 86400000 * 10,
            location: 'Medical Distribution Center, Chicago',
            stakeholder: 'Medical Distributors Inc.',
            stakeholderType: 'warehouse' as const,
            data: { temperature: 15, humidity: 35 },
            hash: 'hash-007-2'
          },
          {
            id: 'evt-007-3',
            status: 'delivered' as const,
            timestamp: Date.now() - 86400000 * 3,
            location: 'CVS Pharmacy, Boston',
            stakeholder: 'CVS Pharmacy',
            stakeholderType: 'retailer' as const,
            data: { temperature: 22, humidity: 45 },
            hash: 'hash-007-3'
          }
        ]
      }
    ];
    for (const product of sampleProducts) {
      await addDoc(productsRef, product);
    }
  }
};
