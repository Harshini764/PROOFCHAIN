import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Search,
  QrCode,
  Users,
  Shield,
  FileText,
  Package,
  CheckCircle,
  Truck,
  Sparkles,
  Globe
} from 'lucide-react';

import Dashboard from '@/components/Dashboard';
import ProductTracking from '@/components/ProductTracking';
import QRScanner from '@/components/QRScanner';
import StakeholderPanel from '@/components/StakeholderPanel';
import BlockchainLog from '@/components/BlockchainLog';
import ProductAuth from '@/components/ProductAuth';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tracking':
        return <ProductTracking />;
      case 'scanner':
        return <QRScanner />;
      case 'stakeholders':
        return <StakeholderPanel />;
      case 'blockchain':
        return <BlockchainLog />;
      case 'auth':
        return <ProductAuth />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  PROOFCHAIN - Scan with Ease. Verify with Certainty Trust with Confidence.
                </h1>
                <p className="text-gray-300 text-sm flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                  Transparent • Secure • Traceable
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 transition-colors">
                <CheckCircle className="h-3 w-3 mr-1" />
                Blockchain Active
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                <Truck className="h-3 w-3 mr-1" />
                Real-time Tracking
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                <Shield className="h-3 w-3 mr-1" />
                Anti-Counterfeit
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl shadow-purple-500/25 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Globe className="h-8 w-8" />
              Welcome to the Future of Supply Chain
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Experience transparent, tamper-proof retail supply chain management powered by blockchain technology.
              Track products from manufacturing to delivery with complete authenticity verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="bg-blue-500/20 rounded-lg p-3 w-fit mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <Package className="h-8 w-8" />
                </div>
                <p className="font-semibold text-lg mb-2">End-to-End Tracking</p>
                <p className="text-blue-100">From origin to customer</p>
              </div>
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="bg-green-500/20 rounded-lg p-3 w-fit mb-4 group-hover:bg-green-500/30 transition-colors">
                  <Shield className="h-8 w-8" />
                </div>
                <p className="font-semibold text-lg mb-2">Tamper-Proof Records</p>
                <p className="text-blue-100">Blockchain secured data</p>
              </div>
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="bg-purple-500/20 rounded-lg p-3 w-fit mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <Users className="h-8 w-8" />
                </div>
                <p className="font-semibold text-lg mb-2">Multi-Stakeholder</p>
                <p className="text-blue-100">Collaborative ecosystem</p>
              </div>
              <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="bg-pink-500/20 rounded-lg p-3 w-fit mb-4 group-hover:bg-pink-500/30 transition-colors">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="font-semibold text-lg mb-2">Authenticity Verified</p>
                <p className="text-blue-100">Anti-counterfeit protection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-blue-500/20 text-blue-300 shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              activeTab === 'tracking'
                ? 'bg-green-500/20 text-green-300 shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Search className="h-6 w-6" />
            <span className="text-sm font-medium">Track Products</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              activeTab === 'scanner'
                ? 'bg-orange-500/20 text-orange-300 shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <QrCode className="h-6 w-6" />
            <span className="text-sm font-medium">QR Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('stakeholders')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              activeTab === 'stakeholders'
                ? 'bg-purple-500/20 text-purple-300 shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm font-medium">Stakeholders</span>
          </button>

          <button
            onClick={() => setActiveTab('blockchain')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              activeTab === 'blockchain'
                ? 'bg-indigo-500/20 text-indigo-300 shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm font-medium">Blockchain Log</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              activeTab === 'auth'
                ? 'bg-red-500/20 text-red-300 shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Shield className="h-6 w-6" />
            <span className="text-sm font-medium">Authentication</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
