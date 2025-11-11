'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Server, 
  Package, 
  Users, 
  Building, 
  MapPin, 
  Settings, 
  Search,
  Plus,
  RefreshCw,
  Wifi,
  HardDrive,
  Battery,
  Monitor,
  Router,
  Activity,
  Factory,
  Tag,
  Calendar,
  DollarSign,
  Wrench,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: 'Tableau de bord',
    href: '/',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble du parc informatique'
  },
  {
    title: 'Équipements',
    href: '/equipements',
    icon: Package,
    description: 'Gestion des équipements IT'
  },
  {
    title: 'Modèles',
    href: '/modeles',
    icon: Server,
    description: 'Catalogue des modèles d\'équipements'
  },
  {
    title: 'Fabricants',
    href: '/fabricants',
    icon: Factory,
    description: 'Liste des fabricants'
  },
  {
    title: 'Établissements',
    href: '/etablissements',
    icon: Building,
    description: 'Gestion des établissements'
  },
  {
    title: 'Localisations',
    href: '/localisations',
    icon: MapPin,
    description: 'Emplacements des équipements'
  },
  {
    title: 'Statuts',
    href: '/statuts',
    icon: Activity,
    description: 'Statuts des équipements'
  },
  {
    title: 'Administration',
    href: '/admin',
    icon: Settings,
    description: 'Configuration du système'
  }
];

const categoryIcons = {
  'Server': Server,
  'Router': Router,
  'Wifi': Wifi,
  'Camera': Monitor,
  'HardDrive': HardDrive,
  'Battery': Battery,
  'Monitor': Monitor,
  'default': Package,
};

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      'border-r bg-gray-50/40 dark:bg-gray-800/40 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">IT Inventory</h1>
                <p className="text-xs text-muted-foreground">Gestion de parc</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "ml-auto p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-blue-100 dark:hover:bg-blue-900/20",
                  isActive 
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" 
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isCollapsed && "mx-auto",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                )} />
                {!isCollapsed && (
                  <>
                    <span>{item.title}</span>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Administrateur</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  admin@inventory.local
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}