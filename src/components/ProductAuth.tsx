import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Scan,
  Lock,
  Unlock,
  Eye,
  FileText
} from 'lucide-react';
import { Product, loadProductsFromStorage, verifyBlockchainIntegrity } from '@/lib/blockchain';

interface AuthenticationResult {
  isAuthentic: boolean;
  confidence: number;
  reasons: string[];
  riskFactors: string[];
  verificationSteps: {
    step: string;
    status: 'passed' | 'failed' | 'warning';
    details: string;
  }[];
}

export default function ProductAuth() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authResult, setAuthResult] = useState<AuthenticationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const loadedProducts = loadProductsFromStorage();
    setProducts(loadedProducts);
  }, []);

  const filteredProducts = products.filter(product =>
    product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const performAuthentication = (product: Product): AuthenticationResult => {
    const verificationSteps: AuthenticationResult['verificationSteps'] = [];
    const reasons: string[] = [];
    const riskFactors: string[] = [];
    let confidence = 100;

    // Step 1: Blockchain Integrity Check
    const blockchainValid = verifyBlockchainIntegrity(product.events);
    verificationSteps.push({
      step: 'Blockchain Integrity',
      status: blockchainValid ? 'passed' : 'failed',
      details: blockchainValid 
        ? 'All transaction hashes verified successfully' 
        : 'Blockchain integrity compromised - potential tampering detected'
    });

    if (!blockchainValid) {
      confidence -= 40;
      riskFactors.push('Blockchain integrity compromised');
    } else {
      reasons.push('Blockchain verified and tamper-proof');
    }

    // Step 2: Manufacturing Origin Verification
    const hasManufacturingEvent = product.events.some(e => e.status === 'manufactured');
    verificationSteps.push({
      step: 'Manufacturing Origin',
      status: hasManufacturingEvent ? 'passed' : 'failed',
      details: hasManufacturingEvent 
        ? `Verified manufacturing by ${product.manufacturer}` 
        : 'No manufacturing record found'
    });

    if (!hasManufacturingEvent) {
      confidence -= 30;
      riskFactors.push('Missing manufacturing record');
    } else {
      reasons.push('Valid manufacturing origin verified');
    }

    // Step 3: Supply Chain Continuity
    const hasCompleteChain = product.events.length >= 2;
    const hasGaps = product.events.some((event, index) => {
      if (index === 0) return false;
      const timeDiff = event.timestamp - product.events[index - 1].timestamp;
      return timeDiff > 30 * 24 * 60 * 60 * 1000; // 30 days gap
    });

    verificationSteps.push({
      step: 'Supply Chain Continuity',
      status: hasCompleteChain && !hasGaps ? 'passed' : hasGaps ? 'warning' : 'failed',
      details: hasCompleteChain 
        ? hasGaps 
          ? 'Supply chain has some gaps but is traceable' 
          : 'Complete and continuous supply chain tracking'
        : 'Insufficient supply chain data'
    });

    if (!hasCompleteChain) {
      confidence -= 20;
      riskFactors.push('Incomplete supply chain data');
    } else if (hasGaps) {
      confidence -= 10;
      riskFactors.push('Supply chain gaps detected');
    } else {
      reasons.push('Complete supply chain traceability');
    }

    // Step 4: Product Information Consistency
    const hasConsistentInfo = product.batchNumber && product.manufacturingDate && product.manufacturer;
    verificationSteps.push({
      step: 'Product Information',
      status: hasConsistentInfo ? 'passed' : 'warning',
      details: hasConsistentInfo 
        ? 'All product information fields are complete' 
        : 'Some product information is missing'
    });

    if (!hasConsistentInfo) {
      confidence -= 15;
      riskFactors.push('Incomplete product information');
    } else {
      reasons.push('Complete product documentation');
    }

    // Step 5: Stakeholder Verification
    const uniqueStakeholders = new Set(product.events.map(e => e.stakeholder)).size;
    const hasMinStakeholders = uniqueStakeholders >= 2;
    verificationSteps.push({
      step: 'Stakeholder Verification',
      status: hasMinStakeholders ? 'passed' : 'warning',
      details: `${uniqueStakeholders} unique stakeholders involved in supply chain`
    });

    if (!hasMinStakeholders) {
      confidence -= 10;
      riskFactors.push('Limited stakeholder involvement');
    } else {
      reasons.push('Multiple verified stakeholders');
    }

    // Step 6: Expiry Date Check (if applicable)
    if (product.expiryDate) {
      const isExpired = new Date(product.expiryDate) < new Date();
      verificationSteps.push({
        step: 'Expiry Date Check',
        status: isExpired ? 'warning' : 'passed',
        details: isExpired 
          ? `Product expired on ${product.expiryDate}` 
          : `Product valid until ${product.expiryDate}`
      });

      if (isExpired) {
        confidence -= 5;
        riskFactors.push('Product has expired');
      } else {
        reasons.push('Product within expiry date');
      }
    }

    // Final authenticity determination
    const isAuthentic = confidence >= 70 && product.authenticity;
    
    if (!product.authenticity) {
      confidence = Math.min(confidence, 30);
      riskFactors.push('Product flagged as potentially counterfeit');
    }

    return {
      isAuthentic,
      confidence: Math.max(0, Math.min(100, confidence)),
      reasons,
      riskFactors,
      verificationSteps
    };
  };

  const handleVerifyProduct = () => {
    if (!selectedProduct) return;
    
    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      const result = performAuthentication(selectedProduct);
      setAuthResult(result);
      setIsVerifying(false);
    }, 2000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStepStatusIcon = (status: 'passed' | 'failed' | 'warning') => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Product Authenticity Verification
          </CardTitle>
          <CardDescription>
            Verify product authenticity using blockchain-based supply chain data and anti-counterfeit measures
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter Product ID, Name, Batch Number, or Manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Scan className="h-4 w-4 mr-2" />
              Scan QR
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Product Search Results</CardTitle>
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
                  onClick={() => {
                    setSelectedProduct(product);
                    setAuthResult(null);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{product.name}</span>
                        {product.authenticity ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>ID: {product.id}</p>
                        <p>Batch: {product.batchNumber}</p>
                        <p>Manufacturer: {product.manufacturer}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={product.authenticity ? "default" : "destructive"}>
                        {product.authenticity ? "Verified" : "Suspicious"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products found matching your search</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verification Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Authenticity Verification</span>
              {selectedProduct && (
                <Button 
                  onClick={handleVerifyProduct} 
                  disabled={isVerifying}
                  className="flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Lock className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Verify Product
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {selectedProduct ? 'Product authenticity analysis' : 'Select a product to verify'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-6">
                {/* Product Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedProduct.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">ID:</span>
                    <span>{selectedProduct.id}</span>
                    <span className="text-gray-600">Batch:</span>
                    <span>{selectedProduct.batchNumber}</span>
                    <span className="text-gray-600">Manufacturer:</span>
                    <span>{selectedProduct.manufacturer}</span>
                    <span className="text-gray-600">Category:</span>
                    <span>{selectedProduct.category}</span>
                  </div>
                </div>

                {authResult && (
                  <>
                    {/* Overall Result */}
                    <Alert className={authResult.isAuthentic ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <div className="flex items-center gap-2">
                        {authResult.isAuthentic ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-medium ${authResult.isAuthentic ? 'text-green-800' : 'text-red-800'}`}>
                            {authResult.isAuthentic ? 'Product Authenticated' : 'Authentication Failed'}
                          </h4>
                          <AlertDescription className={authResult.isAuthentic ? 'text-green-700' : 'text-red-700'}>
                            Confidence Score: {authResult.confidence}%
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>

                    {/* Confidence Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confidence Score</span>
                        <span className={`text-sm font-bold ${getConfidenceColor(authResult.confidence)}`}>
                          {authResult.confidence}%
                        </span>
                      </div>
                      <Progress value={authResult.confidence} className="h-2" />
                    </div>

                    {/* Verification Steps */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Verification Steps</h4>
                      {authResult.verificationSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          {getStepStatusIcon(step.status)}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{step.step}</p>
                            <p className="text-xs text-gray-600">{step.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reasons and Risk Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {authResult.reasons.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-green-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Positive Indicators
                          </h4>
                          <ul className="space-y-1">
                            {authResult.reasons.map((reason, index) => (
                              <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {authResult.riskFactors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-700 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Risk Factors
                          </h4>
                          <ul className="space-y-1">
                            {authResult.riskFactors.map((risk, index) => (
                              <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Product Selected</p>
                <p className="text-sm">Choose a product from the search results to verify its authenticity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}