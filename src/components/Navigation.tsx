import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-gray-800 dark:text-white font-medium">
              KryptonPad
            </Link>
          </div>
          <div className="flex space-x-4">
            {/* Add other navigation items here */}
          </div>
        </div>
      </div>
    </nav>
  );
} 