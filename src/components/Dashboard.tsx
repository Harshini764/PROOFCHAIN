import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Truck, Package, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap, Activity, Database } from 'lucide-react';
import { Product, loadProductsFromStorage } from '@/lib/blockchain';
import { useEffect, useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    inTransit: 0,
    delivered: 0,
    authenticity: 0,
    recentAlerts: 0
  });
  const [animatedMetrics, setAnimatedMetrics] = useState({
    totalProducts: 0,
    inTransit: 0,
    delivered: 0,
    authenticity: 0,
    recentAlerts: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadedProducts = loadProductsFromStorage();
    setProducts(loadedProducts);
    toast({
      title: 'Dashboard Loaded',
      description: 'Product data has been loaded successfully.',
    });
  }, []);

  useEffect(() => {
    // Calculate metrics
    const totalProducts = products.length;
    const inTransit = products.filter(p => p.currentStatus === 'in-transit').length;
    const delivered = products.filter(p => p.currentStatus === 'delivered').length;
    const authentic = products.filter(p => p.authenticity).length;
    const authenticity = totalProducts > 0 ? (authentic / totalProducts) * 100 : 0;
    const recentAlerts = products.filter(p => !p.authenticity).length;

    setMetrics({
      totalProducts,
      inTransit,
      delivered,
      authenticity,
      recentAlerts
    });

    // Show notification if unauthentic products detected
    if (recentAlerts > 0) {
      toast({
        title: 'Security Alert',
        description: `${recentAlerts} product(s) failed authenticity verification!`,
        variant: 'destructive',
      });
    }

    // Animate counters
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = duration / steps;
    let currentStep = 0;
    let timer: NodeJS.Timeout;

    const startValues = { ...animatedMetrics };
    const endValues = { totalProducts, inTransit, delivered, authenticity, recentAlerts };

    timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setAnimatedMetrics({
        totalProducts: Math.floor(startValues.totalProducts + (endValues.totalProducts - startValues.totalProducts) * progress),
        inTransit: Math.floor(startValues.inTransit + (endValues.inTransit - startValues.inTransit) * progress),
        delivered: Math.floor(startValues.delivered + (endValues.delivered - startValues.delivered) * progress),
        authenticity: Math.floor(startValues.authenticity + (endValues.authenticity - startValues.authenticity) * progress),
        recentAlerts: Math.floor(startValues.recentAlerts + (endValues.recentAlerts - startValues.recentAlerts) * progress)
      });
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedMetrics(endValues);
      }
    }, increment);

    return () => clearInterval(timer);
  }, [products]);

  const getStatusColor = (status: Product['currentStatus']) => {
    switch (status) {
      case 'manufactured': return 'bg-blue-500/20 border-blue-500/30';
      case 'warehoused': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'in-transit': return 'bg-orange-500/20 border-orange-500/30';
      case 'delivered': return 'bg-green-500/20 border-green-500/30';
      case 'verified': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: Product['currentStatus']) => {
    switch (status) {
      case 'manufactured': return <Package className="h-4 w-4" />;
      case 'warehoused': return <Package className="h-4 w-4" />;
      case 'in-transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'verified': return <Shield className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
      <div className="space-y-8">
        {/* Analytics Dashboard Section */}
        <AnalyticsDashboard />
      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 group hover:scale-105 shadow-lg hover:shadow-glow-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Total Products</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">{animatedMetrics.totalProducts}</div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              Active in supply chain
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 group hover:scale-105 shadow-lg hover:shadow-glow-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">In Transit</CardTitle>
            <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
              <Truck className="h-5 w-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">{animatedMetrics.inTransit}</div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-orange-400" />
              Currently shipping
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 group hover:scale-105 shadow-lg hover:shadow-glow-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Delivered</CardTitle>
            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">{animatedMetrics.delivered}</div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-400" />
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 group hover:scale-105 shadow-lg hover:shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Authenticity Rate</CardTitle>
            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">{animatedMetrics.authenticity.toFixed(1)}%</div>
            <Progress value={animatedMetrics.authenticity} className="mt-2 h-2 bg-white/20" />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              Recent Product Activity
            </CardTitle>
            <CardDescription className="text-gray-300">Latest supply chain updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(product.currentStatus)} animate-pulse`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.currentLocation}</p>
                  </div>
                  <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(product.currentStatus)} text-white border-0`}>
                    {getStatusIcon(product.currentStatus)}
                    {product.currentStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              Security Alerts
            </CardTitle>
            <CardDescription className="text-gray-300">Products requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.filter(p => !p.authenticity).slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-orange-200">{product.name}</p>
                    <p className="text-xs text-orange-300">Authenticity verification failed</p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30">
                    Alert
                  </Badge>
                </div>
              ))}
              {products.filter(p => !p.authenticity).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="p-4 bg-green-500/10 rounded-full w-fit mx-auto mb-4">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-green-300">No security alerts</p>
                  <p className="text-xs text-gray-400 mt-1">All products verified</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Status Overview */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Package className="h-5 w-5 text-purple-400" />
            </div>
            Supply Chain Status Overview
          </CardTitle>
          <CardDescription className="text-gray-300">Real-time status distribution across all products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['manufactured', 'warehoused', 'in-transit', 'delivered', 'verified'].map((status) => {
              const count = products.filter(p => p.currentStatus === status).length;
              const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
              
              return (
                <div key={status} className="text-center group">
                  <div className={`w-20 h-20 mx-auto rounded-2xl ${getStatusColor(status as Product['currentStatus'])} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-white font-bold text-xl">{count}</span>
                  </div>
                  <p className="text-sm font-medium capitalize text-white">{status}</p>
                  <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}