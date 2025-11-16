'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Server,
  Package,
  Building,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus
} from 'lucide-react';

interface StatsCardsProps {
  counts: {
    fabricants: number;
    categories: number;
    modeles: number;
    statuts: number;
    etablissements: number;
    localisations: number;
    equipements: number;
    supervisions: number;
  };
  valueStats?: {
    _sum: {
      prix: number | null;
    };
    _avg: {
      prix: number | null;
    };
  };
}

type StatKey = keyof StatsCardsProps['counts'] | 'assetValue' | 'avgPrice';

interface StatDefinition {
  key: StatKey;
  title: string;
  description: string;
  icon: typeof Package;
  color: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency';
}

const statsConfig: StatDefinition[] = [
  {
    key: 'equipements',
    title: 'Équipements',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Total inventorié',
    trend: 'up',
  },
  {
    key: 'modeles',
    title: 'Modèles',
    icon: Server,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Catalogue modèles',
    trend: 'up',
  },
  {
    key: 'etablissements',
    title: 'Établissements',
    icon: Building,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Sites actifs',
    trend: 'stable',
  },
  {
    key: 'localisations',
    title: 'Localisations',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Emplacements suivis',
    trend: 'up',
  },
  {
    key: 'assetValue',
    title: 'Valeur du parc',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Valeur totale estimée',
    trend: 'up',
    format: 'currency',
  },
  {
    key: 'avgPrice',
    title: 'Prix moyen',
    icon: Activity,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Par équipement',
    trend: 'stable',
    format: 'currency',
  },
];

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const formatValue = (value: number, format?: StatDefinition['format']) => {
  if (format === 'currency') {
    return currencyFormatter.format(value);
  }
  return value.toLocaleString('fr-FR');
};

export default function StatsCards({ counts, valueStats }: StatsCardsProps) {
  const stats = statsConfig.map((stat) => {
    let value = 0;

    if (stat.key === 'assetValue') {
      value = valueStats?._sum.prix ?? 0;
    } else if (stat.key === 'avgPrice') {
      value = valueStats?._avg.prix ?? 0;
    } else {
      value = counts[stat.key as keyof typeof counts] ?? 0;
    }

    return {
      ...stat,
      value,
      displayValue: formatValue(value, stat.format),
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : null;

        return (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.description}
                  </CardTitle>
                  <p className="text-2xl font-bold">{stat.displayValue}</p>
                </div>
              </div>
              {TrendIcon && (
                <TrendIcon className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.title}
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}