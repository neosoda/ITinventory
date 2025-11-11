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
  Plus
} from 'lucide-react';

interface StatsCardsProps {
  data: {
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
  };
}

const statsConfig = [
  {
    title: 'Équipements',
    value: 0,
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Total équipements',
    trend: 'up'
  },
  {
    title: 'Modèles',
    value: 0,
    icon: Server,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Catalogue modèles',
    trend: 'up'
  },
  {
    title: 'Établissements',
    value: 0,
    icon: Building,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Sites actifs',
    trend: 'stable'
  },
  {
    title: 'Localisations',
    value: 0,
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Emplacements',
    trend: 'up'
  }
];

export default function StatsCards({ data }: StatsCardsProps) {
  const stats = statsConfig.map(stat => ({
    ...stat,
    value: data.counts[stat.title.toLowerCase() as keyof typeof data.counts] || 0
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
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