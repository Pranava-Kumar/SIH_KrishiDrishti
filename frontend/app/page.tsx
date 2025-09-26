// frontend/app/page.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl flex flex-col items-center">
      <div className="text-center mb-12 w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">KrishiDrishti</h1>
        <p className="text-lg text-gray-600 mb-6">AI-Powered Crop Health Monitoring</p>
        <p className="text-gray-500 max-w-3xl mx-auto">
          Advanced hyperspectral and multispectral imaging for early detection of crop stress, 
          pest risks, and diseases. Get actionable insights 7-10 days before visible symptoms appear.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-16">
        <Link
          href="/dashboard"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-blue-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Field Dashboard</h3>
          <p className="text-gray-600 mb-4">View overall field health scores and risk levels</p>
          <div className="text-blue-600 font-medium">Explore Dashboard →</div>
        </Link>
        
        <Link
          href="/upload"
          className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Upload Data</h3>
          <p className="text-gray-600 mb-4">Upload hyperspectral/multispectral images for analysis</p>
          <div className="text-green-600 font-medium">Upload Files →</div>
        </Link>
        
        <Link
          href="/field-map"
          className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-amber-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Field Map</h3>
          <p className="text-gray-600 mb-4">Visualize NDVI, RGB, and risk maps</p>
          <div className="text-amber-600 font-medium">View Map →</div>
        </Link>
        
        <Link
          href="/trends"
          className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Trend Analysis</h3>
          <p className="text-gray-600 mb-4">Track health metrics over time</p>
          <div className="text-purple-600 font-medium">View Trends →</div>
        </Link>
        
        <Link
          href="/alerts"
          className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-red-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Risk Alerts</h3>
          <p className="text-gray-600 mb-4">Immediate notifications for detected issues</p>
          <div className="text-red-600 font-medium">View Alerts →</div>
        </Link>
        
        <Link
          href="/reports"
          className="bg-gradient-to-r from-cyan-50 to-sky-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-cyan-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Reports</h3>
          <p className="text-gray-600 mb-4">Comprehensive PDF reports for sharing</p>
          <div className="text-cyan-600 font-medium">Generate Report →</div>
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hyperspectral Analysis</h3>
            <p className="text-gray-600">Compute NDVI, NDRE, MSI, and SAVI indices from hyperspectral data</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Risk Detection</h3>
            <p className="text-gray-600">CNN models detect stress/pest zones early</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-600 font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Actionable Insights</h3>
            <p className="text-gray-600">Clear recommendations for treatment and prevention</p>
          </div>
        </div>
      </div>
    </div>
  );
}