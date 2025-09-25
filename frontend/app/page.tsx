// frontend/app/page.tsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust min-h if header/footer height changes */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">KrishiDrishti</h1>
        <p className="text-lg text-gray-600 mb-6">AI-Powered Crop Health Monitoring</p>
        <p className="text-gray-500 max-w-2xl">
          Upload an image of your crop to get instant AI analysis for potential diseases or health issues.
          Receive actionable recommendations to protect your yield.
        </p>
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/upload"
          className="block w-full px-6 py-4 bg-blue-600 text-white text-center font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          Start Analysis
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Detection</h3>
          <p className="text-gray-600">Get results in seconds using advanced AI.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Actionable Insights</h3>
          <p className="text-gray-600">Receive clear recommendations for treatment.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Easy to Use</h3>
          <p className="text-gray-600">Simple upload process for any farmer.</p>
        </div>
      </div>
    </div>
  );
}