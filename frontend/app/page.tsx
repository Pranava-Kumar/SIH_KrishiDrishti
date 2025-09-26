// frontend/app/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import ThreeScene from '@/components/ThreeScene';
import { Button } from "@/components/ui/button";
import { Leaf, Eye, BarChart3, Zap, Shield, Download, Upload, Map, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading KrishiDrishti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with 3D Scene */}
      <div className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <ThreeScene />
            
            <Environment preset="city" />
            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              enableRotate={true} 
              autoRotate 
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-white/20">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                KrishiDrishti
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              AI-Powered Precision Agriculture for the Modern Farmer
            </p>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Monitor crop health, detect diseases early, and optimize yields using advanced 
              hyperspectral imaging and machine learning algorithms.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/upload">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  Start Analysis
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  View Dashboard
                  <BarChart3 className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Transform Your Farming Experience
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Early Disease Detection</h3>
              <p className="text-gray-600 mb-4">
                Identify crop stress and diseases 7-10 days before visible symptoms appear 
                using advanced hyperspectral analysis.
              </p>
              <div className="text-green-600 font-medium">AI-Powered Accuracy</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Real-Time Monitoring</h3>
              <p className="text-gray-600 mb-4">
                Continuous field monitoring with actionable insights delivered directly 
                to your dashboard.
              </p>
              <div className="text-blue-600 font-medium">Instant Notifications</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Precision Recommendations</h3>
              <p className="text-gray-600 mb-4">
                Get zone-specific treatment recommendations with precise application 
                rates and timing.
              </p>
              <div className="text-purple-600 font-medium">Expert-Level Guidance</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why KrishiDrishti?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg">Detection Accuracy</div>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">7-10</div>
              <div className="text-lg">Days Early Warning</div>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">30s</div>
              <div className="text-lg">Analysis Time</div>
            </div>
            
            <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-lg">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Navigation */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Quick Access</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link href="/upload">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border border-gray-200">
                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800">Upload Data</h3>
              </div>
            </Link>
            
            <Link href="/field-map">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border border-gray-200">
                <Map className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800">Field Map</h3>
              </div>
            </Link>
            
            <Link href="/alerts">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border border-gray-200">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800">Alerts</h3>
              </div>
            </Link>
            
            <Link href="/reports">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center border border-gray-200">
                <Download className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800">Reports</h3>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Transform Your Farm?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Join thousands of farmers who are already using KrishiDrishti to increase yields, 
            reduce costs, and protect their crops.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                Get Started Free
                <Download className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-10 bg-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-4">KrishiDrishti - Empowering Farmers with AI</p>
          <p className="text-gray-400">© {new Date().getFullYear()} KrishiDrishti. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}