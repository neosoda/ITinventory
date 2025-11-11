'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Calendar, 
  MapPin, 
  Building,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RecentEquipmentsProps {
  equipements: Array<{
    id: number;
    assetTag?: string;
    nom?: string;
    hostname?: string;
    modele: {
      id: number;
      nom: string;
      fabricant: {
        id: number;
        nom: string;
      };
      categorie: {
        id: number;
        nom: string;
        icone?: string;
      };
    };
    etablissement: {
      id: number;
      nom: string;
    };
    localisation?: {
      id: number;
      nom: string;
      batiment?: string;
      etage?: string;
      salle?: string;
    };
    statut: {
      id: number;
      nom: string;
      type: string;
      couleur?: string;
    };
    createdAt: string;
  }>;
}

export default function RecentEquipments({ equipements }: RecentEquipmentsProps) {
  const getStatusColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'en maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'hors service': return 'bg-red-100 text-red-800';
      case 'archivé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Équipements récents</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {equipements.slice(0, 5).map((equipement) => (
            <div key={equipement.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Status Badge */}
                <Badge 
                  className={getStatusColor(equipement.statut.type)}
                  style={{ backgroundColor: equipement.statut.couleur ? `${equipement.statut.couleur}20` : undefined }}
                >
                  {equipement.statut.nom}
                </Badge>

                {/* Equipment Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {equipement.assetTag || equipement.nom || equipement.hostname || 'Équipement sans nom'}
                    </h4>
                    <span className="text-xs text-gray-500">
                      #{equipement.id}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{equipement.etablissement.nom}</span>
                    </div>
                    
                    {equipement.localisation && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {equipement.localisation.batiment && `${equipement.localisation.batiment} `}
                          {equipement.localisation.etage && `Étage ${equipement.localisation.etage} `}
                          {equipement.localisation.salle && `- ${equipement.localisation.salle}`}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(equipement.createdAt), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    {equipement.modele.fabricant.nom} - {equipement.modele.nom}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {equipements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Aucun équipement trouvé</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}