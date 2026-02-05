# PROOFCHAIN - Design Document

## System Architecture

### High-Level Architecture

PROOFCHAIN follows a modern web application architecture with the following key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   React + TS    │◄──►│   Firebase      │◄──►│   Immutable     │
│   Vite + Tailwind│    │   Firestore     │    │   Records       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Real-time DB  │    │   Hash Chain    │
│   State Mgmt    │    │   Authentication│    │   Verification  │
│   Routing       │    │   Cloud Funcs   │    │   Audit Trail   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: Zustand for global state, React Query for server state
- **Routing**: React Router DOM for client-side navigation
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth transitions

#### Backend Services
- **Database**: Firebase Firestore (NoSQL document database)
- **Authentication**: Firebase Auth with session persistence
- **Real-time Updates**: Firestore real-time listeners
- **Cloud Functions**: Firebase Functions for server-side logic
- **Storage**: Firebase Storage for file uploads
- **Hosting**: Firebase Hosting for static site deployment

#### Development Tools
- **Package Manager**: pnpm for efficient dependency management
- **Linting**: ESLint with TypeScript rules
- **Code Formatting**: Prettier for consistent code style
- **Type Checking**: TypeScript for compile-time type safety
- **Testing**: Vitest for unit testing, Playwright for E2E testing

## Data Architecture

### Database Schema

#### Products Collection
```typescript
interface Product {
  id: string;                    // Unique product identifier
  name: string;                  // Product name
  category: string;              // Product category (electronics, pharmaceuticals, etc.)
  manufacturer: string;          // Manufacturing company
  batchNumber: string;           // Manufacturing batch identifier
  manufacturingDate: string;     // ISO date string
  expiryDate?: string;          // Optional expiry date for perishables
  authenticity: boolean;         // Authenticity verification status
  currentStatus: ProductStatus;  // Current supply chain status
  currentLocation: string;       // Current physical location
  currentStock: number;          // Available quantity
  events: SupplyChainEvent[];    // Complete event history
  metadata?: Record<string, any>; // Additional product-specific data
  createdAt: Timestamp;         // Document creation time
  updatedAt: Timestamp;         // Last update time
}

type ProductStatus = 
  | 'manufactured' 
  | 'warehoused' 
  | 'in-transit' 
  | 'delivered' 
  | 'verified';
```

#### Events Subcollection
```typescript
interface SupplyChainEvent {
  id: string;                    // Unique event identifier
  productId: string;             // Reference to parent product
  timestamp: number;             // Unix timestamp
  location: string;              // Event location
  status: ProductStatus;         // Status after this event
  stakeholder: string;           // Entity responsible for event
  stakeholderType: StakeholderType; // Type of stakeholder
  hash: string;                  // Blockchain hash for verification
  previousHash: string;          // Previous event hash for chain integrity
  data: EventData;              // Event-specific data
  signature?: string;           // Digital signature for authenticity
}

type StakeholderType = 
  | 'manufacturer' 
  | 'warehouse' 
  | 'transporter' 
  | 'retailer' 
  | 'customer';

interface EventData {
  temperature?: number;          // Environmental temperature
  humidity?: number;            // Environmental humidity
  notes?: string;               // Additional notes
  images?: string[];            // Photo evidence URLs
  documents?: string[];         // Document URLs
  sensors?: Record<string, any>; // IoT sensor data
}
```

#### Users Collection
```typescript
interface User {
  uid: string;                  // Firebase Auth UID
  email: string;                // User email
  displayName: string;          // User display name
  role: UserRole;               // User role in system
  organization: string;         // Company/organization name
  permissions: Permission[];    // Specific permissions
  createdAt: Timestamp;         // Account creation time
  lastLoginAt: Timestamp;       // Last login time
  isActive: boolean;            // Account status
}

type UserRole = 
  | 'admin' 
  | 'manufacturer' 
  | 'warehouse_operator' 
  | 'transporter' 
  | 'retailer' 
  | 'consumer';

type Permission = 
  | 'create_product' 
  | 'update_product' 
  | 'view_analytics' 
  | 'manage_users' 
  | 'verify_authenticity';
```

### Data Flow Architecture

```
┌─────────────────┐
│   User Action   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│   React State   │◄──►│   React Query   │
│   (Zustand)     │    │   (Server State)│
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   Local Storage │    │   Firestore     │
│   (Offline)     │    │   (Real-time)   │
└─────────────────┘    └─────────┬───────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │   Blockchain    │
                       │   (Immutable)   │
                       └─────────────────┘
```

## Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Login (Public Route)
│   └── Index (Protected Route)
│       ├── Header
│       │   ├── Logo
│       │   ├── Navigation
│       │   └── UserMenu
│       ├── TabNavigation
│       └── ContentArea
│           ├── Dashboard
│           │   ├── AnalyticsDashboard
│           │   ├── MetricsCards
│           │   ├── ActivityFeed
│           │   └── ProductAdd
│           ├── ProductTracking
│           │   ├── SearchBar
│           │   ├── ProductList
│           │   └── ProductDetails
│           ├── QRScanner
│           │   ├── CameraView
│           │   └── ScanResults
│           ├── StakeholderPanel
│           │   ├── UserManagement
│           │   └── RoleAssignment
│           ├── BlockchainLog
│           │   ├── EventList
│           │   └── VerificationStatus
│           ├── ClaimVerifier
│           │   ├── ClaimForm
│           │   └── VerificationResults
│           └── ProductAuth
│               ├── AuthenticationForm
│               └── CertificateDisplay
```

### Key Components Design

#### Dashboard Component
```typescript
interface DashboardProps {
  // No props - uses global state
}

interface DashboardState {
  products: Product[];
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: string | null;
}

interface DashboardMetrics {
  totalProducts: number;
  inTransit: number;
  delivered: number;
  authenticity: number;
  recentAlerts: number;
}
```

#### ProductTracking Component
```typescript
interface ProductTrackingProps {
  // No props - uses global state
}

interface ProductTrackingState {
  searchQuery: string;
  filteredProducts: Product[];
  selectedProduct: Product | null;
  isBlockchainValid: boolean;
}
```

#### QRScanner Component
```typescript
interface QRScannerProps {
  onScanComplete: (productId: string) => void;
}

interface QRScannerState {
  isScanning: boolean;
  scanResult: string | null;
  error: string | null;
  cameraPermission: 'granted' | 'denied' | 'prompt';
}
```

## User Interface Design

### Design System

#### Color Palette
```css
/* Primary Colors */
--primary-blue: #3B82F6;
--primary-purple: #8B5CF6;
--primary-pink: #EC4899;

/* Status Colors */
--status-manufactured: #3B82F6;    /* Blue */
--status-warehoused: #F59E0B;      /* Yellow */
--status-in-transit: #F97316;      /* Orange */
--status-delivered: #10B981;       /* Green */
--status-verified: #8B5CF6;        /* Purple */

/* Semantic Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

#### Typography Scale
```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Spacing System
```css
/* Spacing Scale (based on 0.25rem = 4px) */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

### Layout Design

#### Responsive Breakpoints
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

#### Grid System
```css
/* 12-column grid system */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Responsive variants */
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
```

### Component Design Patterns

#### Card Component
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

// Usage Examples:
<Card variant="elevated" padding="lg" hover>
  <CardHeader>
    <CardTitle>Product Details</CardTitle>
    <CardDescription>View complete product information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

#### Badge Component
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

// Status-specific badges:
<Badge variant="success" icon={<CheckCircle />}>Verified</Badge>
<Badge variant="warning" icon={<Clock />}>In Transit</Badge>
<Badge variant="error" icon={<AlertTriangle />}>Counterfeit</Badge>
```

#### Button Component
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

// Usage Examples:
<Button variant="primary" size="lg" loading={isSubmitting}>
  Add Product
</Button>
<Button variant="outline" icon={<Search />}>
  Search Products
</Button>
```

## State Management Design

### Global State Architecture

```typescript
// Zustand Store Structure
interface AppState {
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Product State
  products: Product[];
  selectedProduct: Product | null;
  
  // UI State
  activeTab: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setProducts: (products: Product[]) => void;
  selectProduct: (product: Product | null) => void;
  setActiveTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

### React Query Configuration

```typescript
// Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query Keys
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  events: (productId: string) => ['events', productId] as const,
  analytics: ['analytics'] as const,
  users: ['users'] as const,
};
```

## Security Design

### Authentication Flow

```
┌─────────────────┐
│   User Login    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Firebase Auth   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  JWT Token      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Session Storage │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Protected Route │
└─────────────────┘
```

### Data Security Measures

#### Input Validation
```typescript
// Zod Schema for Product Validation
const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['electronics', 'pharmaceuticals', 'food', 'clothing', 'automotive']),
  manufacturer: z.string().min(1).max(100),
  batchNumber: z.string().regex(/^[A-Z0-9-]+$/),
  manufacturingDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  currentStock: z.number().int().min(0),
});
```

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection
    match /products/{productId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.auth.token.role in ['admin', 'manufacturer'];
      allow update: if request.auth != null 
        && request.auth.token.role in ['admin', 'manufacturer', 'warehouse_operator', 'transporter'];
      allow delete: if request.auth != null 
        && request.auth.token.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
      allow read: if request.auth != null 
        && request.auth.token.role == 'admin';
    }
  }
}
```

### Blockchain Integration

#### Hash Chain Implementation
```typescript
interface BlockchainEvent {
  id: string;
  timestamp: number;
  data: any;
  hash: string;
  previousHash: string;
}

class BlockchainService {
  static generateHash(data: any, previousHash: string): string {
    const content = JSON.stringify(data) + previousHash + Date.now();
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
      .then(buffer => Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
  }
  
  static verifyChain(events: BlockchainEvent[]): boolean {
    for (let i = 1; i < events.length; i++) {
      const currentEvent = events[i];
      const previousEvent = events[i - 1];
      
      if (currentEvent.previousHash !== previousEvent.hash) {
        return false;
      }
    }
    return true;
  }
}
```

## Performance Optimization

### Code Splitting Strategy

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProductTracking = lazy(() => import('./components/ProductTracking'));
const QRScanner = lazy(() => import('./components/QRScanner'));

// Component-based code splitting
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const ProductAdd = lazy(() => import('./components/ProductAdd'));
```

### Caching Strategy

```typescript
// Service Worker for offline caching
const CACHE_NAME = 'proofchain-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Cache-first strategy for static assets
// Network-first strategy for API calls
// Stale-while-revalidate for product data
```

### Image Optimization

```typescript
// Responsive image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes: string;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  sizes,
  loading = 'lazy'
}) => {
  return (
    <picture>
      <source
        srcSet={`${src}?w=320 320w, ${src}?w=640 640w, ${src}?w=1024 1024w`}
        sizes={sizes}
        type="image/webp"
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};
```

## Testing Strategy

### Unit Testing
```typescript
// Component testing with React Testing Library
describe('Dashboard Component', () => {
  it('should display product metrics', async () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });
  
  it('should handle loading state', () => {
    const { rerender } = render(<Dashboard />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// API integration testing
describe('Product API', () => {
  it('should create a new product', async () => {
    const productData = {
      name: 'Test Product',
      category: 'electronics',
      manufacturer: 'Test Corp',
      batchNumber: 'TEST-001'
    };
    
    const response = await createProduct(productData);
    
    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
  });
});
```

### E2E Testing
```typescript
// Playwright E2E tests
test('complete product tracking flow', async ({ page }) => {
  await page.goto('/');
  
  // Login
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');
  
  // Navigate to product tracking
  await page.click('[data-testid=tracking-tab]');
  
  // Search for product
  await page.fill('[data-testid=search-input]', 'TEST-001');
  await page.click('[data-testid=search-button]');
  
  // Verify results
  await expect(page.locator('[data-testid=product-result]')).toBeVisible();
});
```

## Deployment Architecture

### Build Process
```yaml
# GitHub Actions CI/CD Pipeline
name: Deploy to Firebase
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build application
        run: pnpm build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: proofchain-80ddf
```

### Environment Configuration
```typescript
// Environment variables
interface EnvironmentConfig {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
  VITE_BLOCKCHAIN_NETWORK: string;
  VITE_API_BASE_URL: string;
}
```

This design document provides a comprehensive technical blueprint for the PROOFCHAIN application, covering architecture, data models, UI design, security, performance, testing, and deployment strategies.