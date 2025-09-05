'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: 'Início', isActive: pathname === '/' },
    { href: '/inss', label: 'INSS', isActive: pathname === '/inss' },
    { href: '/previdencia', label: 'Previdência', isActive: pathname === '/previdencia' },
    { href: '/rescisao', label: 'Rescisão', isActive: pathname === '/rescisao' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Nome */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Meu Futuro Financeiro
              </h1>
              <p className="text-xs text-gray-500">
                Planejamento e Simulações
              </p>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={item.isActive ? 'default' : 'ghost'}
                className={
                  item.isActive
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Navegação Mobile */}
        <nav className="md:hidden pb-4 space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={item.isActive ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                item.isActive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}