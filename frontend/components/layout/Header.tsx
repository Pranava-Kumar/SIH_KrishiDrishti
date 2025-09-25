// frontend/components/layout/Header.tsx

import Link from 'next/link';
import { Button } from "@/components/ui/button";

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          KrishiDrishti
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-gray-600 hover:text-blue-500">
                Home
              </Link>
            </li>
            <li>
              <Link href="/upload" className="text-gray-600 hover:text-blue-500">
                Analyze
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};