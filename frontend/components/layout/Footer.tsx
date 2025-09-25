// frontend/components/layout/Footer.tsx

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} KrishiDrishti. All rights reserved.</p>
        <p className="mt-1">AI-Powered Crop Health Monitoring for SIH 2025.</p>
      </div>
    </footer>
  );
};