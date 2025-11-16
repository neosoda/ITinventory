'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Server,
  Wifi,
  Camera,
  Router,
  Monitor,
  Search,
  Plus,
  RefreshCw,
  Building,
  Activity,
  Package,
  Users,
  HardDrive,
  Settings,
  MapPin,
  Factory,
  Tag,
  Calendar,
  DollarSign,
  Wrench,
  Battery,
  Pencil
} from 'lucide-react';
import StatsCards from '@/components/dashboard/stats-cards';
import RecentEquipments from '@/components/dashboard/recent-equipments';
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/ui/error-boundary';

interface Fabricant {
  id: number;
  nom: string;
  url?: string;
  support?: string;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    modeles: number;
  };
}

interface Categorie {
  id: number;
  nom: string;
  icone?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    modeles: number;
  };
}

interface Modele {
  id: number;
  nom: string;
  numero?: string;
  fabricantId: number;
  categorieId: number;
  description?: string;
  specs?: string;
  createdAt: string;
  updatedAt: string;
  fabricant: {
    id: number;
    nom: string;
  };
  categorie: {
    id: number;
    nom: string;
    icone?: string;
  };
  _count: {
    equipements: number;
  };
}

interface Statut {
  id: number;
  nom: string;
  type: string;
  couleur?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    equipements: number;
  };
}

interface Localisation {
  id: number;
  nom: string;
  batiment?: string;
  etage?: string;
  salle?: string;
  commentaire?: string;
  etablissementId: number;
  createdAt: string;
  updatedAt: string;
  etablissement: {
    id: number;
    nom: string;
  };
  _count: {
    equipements: number;
  };
}

interface Etablissement {
  id: number;
  nom: string;
  uai?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    equipements: number;
    supervisions: number;
    localisations: number;
  };
}

interface Equipement {
  id: number;
  assetTag?: string;
  serial?: string;
  modeleId: number;
  etablissementId: number;
  localisationId?: number;
  statutId: number;
  nom?: string;
  ip?: string;
  mac?: string;
  reseau?: string;
  hostname?: string;
  os?: string;
  versionOs?: string;
  dateAchat?: string;
  dateGarantie?: string;
  prix?: number;
  fournisseur?: string;
  facture?: string;
  notes?: string;
  commentaire?: string;
  createdAt: string;
  updatedAt: string;
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
}

interface DashboardData {
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
  categoriesWithCounts: Categorie[];
  equipementsByStatut: Array<{
    statutId: number;
    _count: { statutId: number };
  }>;
  supervisionTotals: {
    _sum: {
      switchFederateur: number | null;
      switchExtremite: number | null;
      bornesWifi: number | null;
      gtcGtb: number | null;
      serveursPhysiques: number | null;
      nbVm: number | null;
      nbPostes: number | null;
    };
  };
  recentEquipements: Equipement[];
  valueStats: {
    _sum: {
      prix: number | null;
    };
    _avg: {
      prix: number | null;
    };
  };
}

const categoryIcons: Record<string, any> = {
  'Server': Server,
  'Router': Router,
  'Wifi': Wifi,
  'Camera': Camera,
  'HardDrive': HardDrive,
  'Battery': Battery,
  'Monitor': Monitor,
  'default': Package,
};

function getCategoryIcon(icone?: string) {
  if (!icone) return categoryIcons.default;
  return categoryIcons[icone] || categoryIcons.default;
}

function getStatusColor(couleur?: string) {
  if (couleur) return couleur;
  return '#6b7280';
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fabricants, setFabricants] = useState<Fabricant[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [localisations, setLocalisations] = useState<Localisation[]>([]);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedEtablissement, setSelectedEtablissement] = useState<string>('all');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('all');
  const [selectedFabricant, setSelectedFabricant] = useState<string>('all');
  const [selectedStatut, setSelectedStatut] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showAddEtablissement, setShowAddEtablissement] = useState(false);
  const [showAddFabricant, setShowAddFabricant] = useState(false);
  const [showAddCategorie, setShowAddCategorie] = useState(false);
  const [showAddModele, setShowAddModele] = useState(false);
  const [showAddStatut, setShowAddStatut] = useState(false);
  const [showAddLocalisation, setShowAddLocalisation] = useState(false);

  const [newEquipment, setNewEquipment] = useState({
    assetTag: '',
    serial: '',
    modeleId: '',
    etablissementId: '',
    localisationId: '',
    statutId: '',
    nom: '',
    ip: '',
    mac: '',
    reseau: '',
    hostname: '',
    os: '',
    versionOs: '',
    dateAchat: '',
    dateGarantie: '',
    prix: '',
    fournisseur: '',
    facture: '',
    notes: '',
    commentaire: '',
  });

  const [newEtablissement, setNewEtablissement] = useState({
    nom: '',
    uai: '',
    adresse: '',
    telephone: '',
    email: '',
    commentaire: '',
  });

  const [editingEtablissement, setEditingEtablissement] = useState<Etablissement | null>(null);
  const [editEtablissementData, setEditEtablissementData] = useState({
    nom: '',
    uai: '',
    adresse: '',
    telephone: '',
    email: '',
    commentaire: '',
  });

  const [newFabricant, setNewFabricant] = useState({
    nom: '',
    url: '',
    support: '',
    commentaire: '',
  });

  const [newCategorie, setNewCategorie] = useState({
    nom: '',
    icone: '',
    description: '',
  });

  const [newModele, setNewModele] = useState({
    nom: '',
    numero: '',
    fabricantId: '',
    categorieId: '',
    description: '',
    specs: '',
  });

  const [newStatut, setNewStatut] = useState({
    nom: '',
    type: '',
    couleur: '',
    description: '',
  });

  const [newLocalisation, setNewLocalisation] = useState({
    nom: '',
    batiment: '',
    etage: '',
    salle: '',
    commentaire: '',
    etablissementId: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [fabRes, catRes, modRes, statRes, locRes, etabsRes, eqRes, dashRes] = await Promise.all([
        fetch('/api/fabricants'),
        fetch('/api/categories'),
        fetch('/api/modeles'),
        fetch('/api/statuts'),
        fetch('/api/localisations'),
        fetch('/api/etablissements'),
        fetch('/api/equipements'),
        fetch('/api/dashboard'),
      ]);

      // Vérifier si les réponses sont OK
      if (!fabRes.ok || !catRes.ok || !modRes.ok || !statRes.ok || !locRes.ok || !etabsRes.ok || !eqRes.ok || !dashRes.ok) {
        throw new Error('Une erreur est survenue lors du chargement des données');
      }

      const [fabData, catData, modData, statData, locData, etabsData, eqData, dashData] = await Promise.all([
        fabRes.json(),
        catRes.json(),
        modRes.json(),
        statRes.json(),
        locRes.json(),
        etabsRes.json(),
        eqRes.json(),
        dashRes.json(),
      ]);

      setFabricants(fabData);
      setCategories(catData);
      setModeles(modData);
      setStatuts(statData);
      setLocalisations(locData);
      setEtablissements(etabsData);
      setEquipements(eqData);
      setDashboardData(dashData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      if (error instanceof Error && error.message.includes('Clipboard')) {
        console.warn('Clipboard API blocked - this is expected in some environments');
      } else {
        // Show error for other types of errors
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      await fetchData();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const handleAddEquipment = async () => {
    try {
      // Convert localisationId to null if "empty" is selected
      const equipmentData = {
        ...newEquipment,
        localisationId: newEquipment.localisationId === 'empty' ? null : newEquipment.localisationId,
      };

      const response = await fetch('/api/equipements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentData),
      });

      if (response.ok) {
        setShowAddEquipment(false);
        setNewEquipment({
          assetTag: '',
          serial: '',
          modeleId: '',
          etablissementId: '',
          localisationId: '',
          statutId: '',
          nom: '',
          ip: '',
          mac: '',
          reseau: '',
          hostname: '',
          os: '',
          versionOs: '',
          dateAchat: '',
          dateGarantie: '',
          prix: '',
          fournisseur: '',
          facture: '',
          notes: '',
          commentaire: '',
        });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const handleAddEtablissement = async () => {
    try {
      const response = await fetch('/api/etablissements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEtablissement),
      });

      if (response.ok) {
        setShowAddEtablissement(false);
        setNewEtablissement({ nom: '', uai: '', adresse: '', telephone: '', email: '', commentaire: '' });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding etablissement:', error);
    }
  };

  const openEditEtablissement = (etab: Etablissement) => {
    setEditingEtablissement(etab);
    setEditEtablissementData({
      nom: etab.nom ?? '',
      uai: etab.uai ?? '',
      adresse: etab.adresse ?? '',
      telephone: etab.telephone ?? '',
      email: etab.email ?? '',
      commentaire: etab.commentaire ?? '',
    });
  };

  const resetEditEtablissement = () => {
    setEditingEtablissement(null);
    setEditEtablissementData({
      nom: '',
      uai: '',
      adresse: '',
      telephone: '',
      email: '',
      commentaire: '',
    });
  };

  const handleUpdateEtablissement = async () => {
    if (!editingEtablissement) return;

    try {
      const response = await fetch(`/api/etablissements/${editingEtablissement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEtablissementData),
      });

      if (response.ok) {
        resetEditEtablissement();
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating etablissement:', error);
    }
  };

  const handleAddFabricant = async () => {
    try {
      const response = await fetch('/api/fabricants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFabricant),
      });

      if (response.ok) {
        setShowAddFabricant(false);
        setNewFabricant({ nom: '', url: '', support: '', commentaire: '' });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding fabricant:', error);
    }
  };

  const handleAddCategorie = async () => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategorie),
      });

      if (response.ok) {
        setShowAddCategorie(false);
        setNewCategorie({ nom: '', icone: '', description: '' });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding categorie:', error);
    }
  };

  const handleAddModele = async () => {
    try {
      const response = await fetch('/api/modeles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModele),
      });

      if (response.ok) {
        setShowAddModele(false);
        setNewModele({ nom: '', numero: '', fabricantId: '', categorieId: '', description: '', specs: '' });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding modele:', error);
    }
  };

  const handleAddStatut = async () => {
    try {
      const response = await fetch('/api/statuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStatut),
      });

      if (response.ok) {
        setShowAddStatut(false);
        setNewStatut({ nom: '', type: '', couleur: '', description: '' });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding statut:', error);
    }
  };

  const handleAddLocalisation = async () => {
    try {
      const response = await fetch('/api/localisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocalisation),
      });

      if (response.ok) {
        setShowAddLocalisation(false);
        setNewLocalisation({ nom: '', batiment: '', etage: '', salle: '', commentaire: '', etablissementId: '' });
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding localisation:', error);
    }
  };

  const filteredEquipements = useMemo(() => {
    return equipements.filter((eq) => {
      const matchesEtablissement = selectedEtablissement === 'all' || eq.etablissementId.toString() === selectedEtablissement;
      const matchesCategorie = selectedCategorie === 'all' || eq.modele.categorie.id.toString() === selectedCategorie;
      const matchesFabricant = selectedFabricant === 'all' || eq.modele.fabricant.id.toString() === selectedFabricant;
      const matchesStatut = selectedStatut === 'all' || eq.statutId.toString() === selectedStatut;
      const matchesSearch = searchTerm === '' ||
        eq.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.mac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.modele.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.modele.fabricant.nom.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesEtablissement && matchesCategorie && matchesFabricant && matchesStatut && matchesSearch;
    });
  }, [equipements, selectedEtablissement, selectedCategorie, selectedFabricant, selectedStatut, searchTerm]);

  if (loading) {
    return <LoadingCard message="Chargement des données..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Erreur de chargement"
        description={error}
        onRetry={() => {
          setError(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventaire IT</h1>
          <p className="text-muted-foreground">Gestion complète inspirée de Snipe-IT</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={seedData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Initialiser les données
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <StatsCards counts={dashboardData.counts} valueStats={dashboardData.valueStats} />
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Statut des équipements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.equipementsByStatut.map((statut) => {
                    const statutInfo = statuts.find(s => s.id === statut.statutId);
                    return (
                      <div key={statut.statutId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: statutInfo?.couleur || '#6b7280' }}
                          />
                          <span className="text-sm">{statutInfo?.nom || 'Inconnu'}</span>
                        </div>
                        <Badge variant="secondary">{statut._count.statutId}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Equipments */}
            <RecentEquipments equipements={dashboardData.recentEquipements} />
          </div>
        </div>
      )}

      {/* Equipements Content */}
      {activeTab === 'equipements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher des équipements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les établissements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les établissements</SelectItem>
                  {etablissements.map((etab) => (
                    <SelectItem key={etab.id} value={etab.id.toString()}>
                      {etab.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedFabricant} onValueChange={setSelectedFabricant}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les fabricants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fabricants</SelectItem>
                  {fabricants.map((fab) => (
                    <SelectItem key={fab.id} value={fab.id.toString()}>
                      {fab.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatut} onValueChange={setSelectedStatut}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statuts.map((stat) => (
                    <SelectItem key={stat.id} value={stat.id.toString()}>
                      {stat.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredEquipements.length.toLocaleString('fr-FR')} / {equipements.length.toLocaleString('fr-FR')} équipements
            </div>
            <Dialog open={showAddEquipment} onOpenChange={setShowAddEquipment}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter équipement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel équipement</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de l'équipement ci-dessous.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assetTag">Tag d'actif</Label>
                    <Input
                      id="assetTag"
                      placeholder="EX-001"
                      value={newEquipment.assetTag}
                      onChange={(e) => setNewEquipment({...newEquipment, assetTag: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serial">Numéro de série</Label>
                    <Input
                      id="serial"
                      placeholder="ABC123XYZ"
                      value={newEquipment.serial}
                      onChange={(e) => setNewEquipment({...newEquipment, serial: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modele">Modèle</Label>
                    <Select value={newEquipment.modeleId} onValueChange={(value) => setNewEquipment({...newEquipment, modeleId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        {modeles.map((mod) => (
                          <SelectItem key={mod.id} value={mod.id.toString()}>
                            {mod.fabricant.nom} - {mod.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="etablissement">Établissement</Label>
                    <Select value={newEquipment.etablissementId} onValueChange={(value) => setNewEquipment({...newEquipment, etablissementId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un établissement" />
                      </SelectTrigger>
                      <SelectContent>
                        {etablissements.map((etab) => (
                          <SelectItem key={etab.id} value={etab.id.toString()}>
                            {etab.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="localisation">Localisation</Label>
                    <Select value={newEquipment.localisationId} onValueChange={(value) => setNewEquipment({...newEquipment, localisationId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une localisation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">Aucune</SelectItem>
                        {localisations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.etablissement.nom} - {loc.nom} ({loc.batiment} - {loc.etage} - {loc.salle})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="statut">Statut</Label>
                    <Select value={newEquipment.statutId} onValueChange={(value) => setNewEquipment({...newEquipment, statutId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuts.map((stat) => (
                          <SelectItem key={stat.id} value={stat.id.toString()}>
                            {stat.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      placeholder="Nom de l'équipement"
                      value={newEquipment.nom}
                      onChange={(e) => setNewEquipment({...newEquipment, nom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ip">Adresse IP</Label>
                    <Input
                      id="ip"
                      placeholder="192.168.1.100"
                      value={newEquipment.ip}
                      onChange={(e) => setNewEquipment({...newEquipment, ip: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mac">Adresse MAC</Label>
                    <Input
                      id="mac"
                      placeholder="AA:BB:CC:DD:EE:FF"
                      value={newEquipment.mac}
                      onChange={(e) => setNewEquipment({...newEquipment, mac: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reseau">Réseau</Label>
                    <Input
                      id="reseau"
                      placeholder="MGMT, VLAN10, etc."
                      value={newEquipment.reseau}
                      onChange={(e) => setNewEquipment({...newEquipment, reseau: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hostname">Hostname</Label>
                    <Input
                      id="hostname"
                      placeholder="SRV-WEB-01"
                      value={newEquipment.hostname}
                      onChange={(e) => setNewEquipment({...newEquipment, hostname: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="os">Système d'exploitation</Label>
                    <Input
                      id="os"
                      placeholder="Windows Server 2022"
                      value={newEquipment.os}
                      onChange={(e) => setNewEquipment({...newEquipment, os: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="versionOs">Version OS</Label>
                    <Input
                      id="versionOs"
                      placeholder="21H2"
                      value={newEquipment.versionOs}
                      onChange={(e) => setNewEquipment({...newEquipment, versionOs: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateAchat">Date d'achat</Label>
                    <Input
                      id="dateAchat"
                      type="date"
                      value={newEquipment.dateAchat}
                      onChange={(e) => setNewEquipment({...newEquipment, dateAchat: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateGarantie">Date de fin de garantie</Label>
                    <Input
                      id="dateGarantie"
                      type="date"
                      value={newEquipment.dateGarantie}
                      onChange={(e) => setNewEquipment({...newEquipment, dateGarantie: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prix">Prix (€)</Label>
                    <Input
                      id="prix"
                      type="number"
                      placeholder="1500"
                      value={newEquipment.prix}
                      onChange={(e) => setNewEquipment({...newEquipment, prix: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Input
                      id="fournisseur"
                      placeholder="Dell Technologies"
                      value={newEquipment.fournisseur}
                      onChange={(e) => setNewEquipment({...newEquipment, fournisseur: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facture">Numéro de facture</Label>
                    <Input
                      id="facture"
                      placeholder="FAC-2023-001"
                      value={newEquipment.facture}
                      onChange={(e) => setNewEquipment({...newEquipment, facture: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notes supplémentaires..."
                      value={newEquipment.notes}
                      onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="commentaire">Commentaire interne</Label>
                    <Textarea
                      id="commentaire"
                      placeholder="Commentaire pour l'administration..."
                      value={newEquipment.commentaire}
                      onChange={(e) => setNewEquipment({...newEquipment, commentaire: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddEquipment(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEquipment}>
                    Ajouter l'équipement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Modèle</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipements.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.assetTag || '-'}</TableCell>
                      <TableCell>{eq.nom || eq.hostname || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = getCategoryIcon(eq.modele.categorie.icone);
                            return <IconComponent className="h-4 w-4" style={{ color: getStatusColor(eq.modele.categorie.icone) }} />;
                          })()}
                          <span>{eq.modele.fabricant.nom} - {eq.modele.nom}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {eq.localisation ? (
                          <div>
                            <div>{eq.localisation.nom}</div>
                            <div className="text-sm text-muted-foreground">
                              {eq.localisation.batiment} - {eq.localisation.etage} - {eq.localisation.salle}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={eq.statut.type === 'disponible' ? 'default' : eq.statut.type === 'en_maintenance' ? 'destructive' : 'secondary'}
                          style={{ backgroundColor: eq.statut.couleur ? `${eq.statut.couleur}20` : undefined, color: eq.statut.couleur || undefined }}
                        >
                          {eq.statut.nom}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modeles Content */}
      {activeTab === 'modeles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Dialog open={showAddModele} onOpenChange={setShowAddModele}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter modèle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau modèle</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du modèle ci-dessous.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="modeleNom">Nom du modèle</Label>
                    <Input
                      id="modeleNom"
                      placeholder="Dell PowerEdge R740"
                      value={newModele.nom}
                      onChange={(e) => setNewModele({...newModele, nom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modeleNumero">Numéro de modèle</Label>
                    <Input
                      id="modeleNumero"
                      placeholder="R740"
                      value={newModele.numero}
                      onChange={(e) => setNewModele({...newModele, numero: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modeleFabricant">Fabricant</Label>
                    <Select value={newModele.fabricantId} onValueChange={(value) => setNewModele({...newModele, fabricantId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fabricant" />
                      </SelectTrigger>
                      <SelectContent>
                        {fabricants.map((fab) => (
                          <SelectItem key={fab.id} value={fab.id.toString()}>
                            {fab.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="modeleCategorie">Catégorie</Label>
                    <Select value={newModele.categorieId} onValueChange={(value) => setNewModele({...newModele, categorieId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="modeleDescription">Description</Label>
                    <Textarea
                      id="modeleDescription"
                      placeholder="Description du modèle..."
                      value={newModele.description}
                      onChange={(e) => setNewModele({...newModele, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modeleSpecs">Spécifications</Label>
                    <Textarea
                      id="modeleSpecs"
                      placeholder="Spécifications techniques..."
                      value={newModele.specs}
                      onChange={(e) => setNewModele({...newModele, specs: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddModele(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddModele}>
                    Ajouter le modèle
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modeles.map((modele) => {
              const Icon = getCategoryIcon(modele.categorie.icone);
              return (
                <Card key={modele.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" style={{ color: getStatusColor(modele.categorie.icone) }} />
                      {modele.nom}
                    </CardTitle>
                    <CardDescription>
                      {modele.fabricant.nom} - {modele.numero}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Catégorie:</span>
                        <span className="text-sm">{modele.categorie.nom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Équipements:</span>
                        <Badge variant="secondary">{modele._count.equipements}</Badge>
                      </div>
                      {modele.description && (
                        <p className="text-sm text-muted-foreground mt-2">{modele.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Fabricants Content */}
      {activeTab === 'fabricants' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Dialog open={showAddFabricant} onOpenChange={setShowAddFabricant}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter fabricant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau fabricant</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations du fabricant ci-dessous.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="fabricantNom">Nom du fabricant</Label>
                    <Input
                      id="fabricantNom"
                      placeholder="Dell Technologies"
                      value={newFabricant.nom}
                      onChange={(e) => setNewFabricant({...newFabricant, nom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabricantUrl">Site web</Label>
                    <Input
                      id="fabricantUrl"
                      placeholder="https://www.dell.com"
                      value={newFabricant.url}
                      onChange={(e) => setNewFabricant({...newFabricant, url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabricantSupport">Support</Label>
                    <Input
                      id="fabricantSupport"
                      placeholder="support@dell.com"
                      value={newFabricant.support}
                      onChange={(e) => setNewFabricant({...newFabricant, support: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabricantCommentaire">Commentaire</Label>
                    <Textarea
                      id="fabricantCommentaire"
                      placeholder="Notes sur le fabricant..."
                      value={newFabricant.commentaire}
                      onChange={(e) => setNewFabricant({...newFabricant, commentaire: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddFabricant(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddFabricant}>
                    Ajouter le fabricant
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fabricants.map((fabricant) => (
              <Card key={fabricant.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    {fabricant.nom}
                  </CardTitle>
                  {fabricant.url && (
                    <CardDescription>
                      <a 
                        href={fabricant.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Site web
                      </a>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Modèles:</span>
                      <Badge variant="secondary">{fabricant._count.modeles}</Badge>
                    </div>
                    {fabricant.support && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Support:</span>
                        <span className="text-sm">{fabricant.support}</span>
                      </div>
                    )}
                    {fabricant.commentaire && (
                      <p className="text-sm text-muted-foreground mt-2">{fabricant.commentaire}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Etablissements Content */}
      {activeTab === 'etablissements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Dialog open={showAddEtablissement} onOpenChange={setShowAddEtablissement}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter établissement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel établissement</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations de l'établissement ci-dessous.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="etabNom">Nom</Label>
                    <Input
                      id="etabNom"
                      placeholder="Lycée Jean Jaurès"
                      value={newEtablissement.nom}
                      onChange={(e) => setNewEtablissement({...newEtablissement, nom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="etabUai">Code UAI</Label>
                    <Input
                      id="etabUai"
                      placeholder="0123456A"
                      value={newEtablissement.uai}
                      onChange={(e) => setNewEtablissement({...newEtablissement, uai: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="etabAdresse">Adresse</Label>
                    <Input
                      id="etabAdresse"
                      placeholder="123 Rue de l'École"
                      value={newEtablissement.adresse}
                      onChange={(e) => setNewEtablissement({...newEtablissement, adresse: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="etabTelephone">Téléphone</Label>
                    <Input
                      id="etabTelephone"
                      placeholder="01 23 45 67 89"
                      value={newEtablissement.telephone}
                      onChange={(e) => setNewEtablissement({...newEtablissement, telephone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="etabEmail">Email</Label>
                    <Input
                      id="etabEmail"
                      placeholder="contact@etablissement.fr"
                      value={newEtablissement.email}
                      onChange={(e) => setNewEtablissement({...newEtablissement, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="etabCommentaire">Commentaire</Label>
                    <Textarea
                      id="etabCommentaire"
                      placeholder="Notes sur l'établissement..."
                      value={newEtablissement.commentaire}
                      onChange={(e) => setNewEtablissement({...newEtablissement, commentaire: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddEtablissement(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEtablissement}>
                    Ajouter l'établissement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {etablissements.map((etab) => (
              <Card key={etab.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {etab.nom}
                  </CardTitle>
                  {etab.uai && (
                    <CardDescription>
                      Code UAI: {etab.uai}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {etab.adresse && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Adresse:</span>
                        <span className="text-sm">{etab.adresse}</span>
                      </div>
                    )}
                    {etab.telephone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Téléphone:</span>
                        <span className="text-sm">{etab.telephone}</span>
                      </div>
                    )}
                    {etab.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm">{etab.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Équipements:</span>
                      <Badge variant="secondary">{etab._count.equipements}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Localisations:</span>
                      <Badge variant="secondary">{etab._count.localisations}</Badge>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm" onClick={() => openEditEtablissement(etab)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={!!editingEtablissement} onOpenChange={(open) => !open && resetEditEtablissement()}>
            <DialogContent>
              {editingEtablissement && (
                <>
                  <DialogHeader>
                    <DialogTitle>Modifier l'établissement</DialogTitle>
                    <DialogDescription>
                      Modifiez les informations de l'établissement ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="editEtabNom">Nom</Label>
                      <Input
                        id="editEtabNom"
                        value={editEtablissementData.nom}
                        onChange={(e) => setEditEtablissementData({...editEtablissementData, nom: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEtabUai">Code UAI</Label>
                      <Input
                        id="editEtabUai"
                        value={editEtablissementData.uai}
                        onChange={(e) => setEditEtablissementData({...editEtablissementData, uai: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEtabAdresse">Adresse</Label>
                      <Input
                        id="editEtabAdresse"
                        value={editEtablissementData.adresse}
                        onChange={(e) => setEditEtablissementData({...editEtablissementData, adresse: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEtabTelephone">Téléphone</Label>
                      <Input
                        id="editEtabTelephone"
                        value={editEtablissementData.telephone}
                        onChange={(e) => setEditEtablissementData({...editEtablissementData, telephone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEtabEmail">Email</Label>
                      <Input
                        id="editEtabEmail"
                        value={editEtablissementData.email}
                        onChange={(e) => setEditEtablissementData({...editEtablissementData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEtabCommentaire">Commentaire</Label>
                      <Textarea
                        id="editEtabCommentaire"
                        value={editEtablissementData.commentaire}
                        onChange={(e) => setEditEtablissementData({...editEtablissementData, commentaire: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetEditEtablissement}>
                      Annuler
                    </Button>
                    <Button onClick={handleUpdateEtablissement}>
                      Mettre à jour
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Administration Content */}
      {activeTab === 'administration' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Catégories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.icone);
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" style={{ color: getStatusColor(cat.icone) }} />
                        <div>
                          <p className="font-medium">{cat.nom}</p>
                          <p className="text-sm text-muted-foreground">{cat._count.modeles} modèles</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Dialog open={showAddCategorie} onOpenChange={setShowAddCategorie}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter catégorie
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
                      <DialogDescription>
                        Remplissez les informations de la catégorie ci-dessous.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="categorieNom">Nom</Label>
                        <Input
                          id="categorieNom"
                          placeholder="Serveur"
                          value={newCategorie.nom}
                          onChange={(e) => setNewCategorie({...newCategorie, nom: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="categorieIcone">Icône</Label>
                        <Select value={newCategorie.icone} onValueChange={(value) => setNewCategorie({...newCategorie, icone: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une icône" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Server">Serveur</SelectItem>
                            <SelectItem value="Router">Routeur</SelectItem>
                            <SelectItem value="Wifi">WiFi</SelectItem>
                            <SelectItem value="Camera">Caméra</SelectItem>
                            <SelectItem value="HardDrive">Disque dur</SelectItem>
                            <SelectItem value="Battery">Batterie</SelectItem>
                            <SelectItem value="Monitor">Moniteur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="categorieDescription">Description</Label>
                        <Textarea
                          id="categorieDescription"
                          placeholder="Description de la catégorie..."
                          value={newCategorie.description}
                          onChange={(e) => setNewCategorie({...newCategorie, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddCategorie(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddCategorie}>
                        Ajouter la catégorie
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Statuts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statuts.map((stat) => (
                  <div key={stat.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stat.couleur || '#6b7280' }}
                      />
                      <div>
                        <p className="font-medium">{stat.nom}</p>
                        <p className="text-sm text-muted-foreground">{stat.type} - {stat._count.equipements} équipements</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Dialog open={showAddStatut} onOpenChange={setShowAddStatut}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter statut
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un nouveau statut</DialogTitle>
                      <DialogDescription>
                        Remplissez les informations du statut ci-dessous.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="statutNom">Nom</Label>
                        <Input
                          id="statutNom"
                          placeholder="Disponible"
                          value={newStatut.nom}
                          onChange={(e) => setNewStatut({...newStatut, nom: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="statutType">Type</Label>
                        <Select value={newStatut.type} onValueChange={(value) => setNewStatut({...newStatut, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponible">Disponible</SelectItem>
                            <SelectItem value="attribue">Attribué</SelectItem>
                            <SelectItem value="en_maintenance">En maintenance</SelectItem>
                            <SelectItem value="retire">Retiré</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="statutCouleur">Couleur</Label>
                        <Input
                          id="statutCouleur"
                          type="color"
                          value={newStatut.couleur}
                          onChange={(e) => setNewStatut({...newStatut, couleur: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="statutDescription">Description</Label>
                        <Textarea
                          id="statutDescription"
                          placeholder="Description du statut..."
                          value={newStatut.description}
                          onChange={(e) => setNewStatut({...newStatut, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddStatut(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddStatut}>
                        Ajouter le statut
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localisations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {localisations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{loc.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {loc.etablissement.nom} - {loc.batiment} - {loc.etage} - {loc.salle}
                      </p>
                      <p className="text-sm text-muted-foreground">{loc._count.equipements} équipements</p>
                    </div>
                  </div>
                ))}
                <Dialog open={showAddLocalisation} onOpenChange={setShowAddLocalisation}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter localisation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle localisation</DialogTitle>
                      <DialogDescription>
                        Remplissez les informations de la localisation ci-dessous.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="localisationNom">Nom</Label>
                        <Input
                          id="localisationNom"
                          placeholder="Salle serveurs"
                          value={newLocalisation.nom}
                          onChange={(e) => setNewLocalisation({...newLocalisation, nom: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="localisationBatiment">Bâtiment</Label>
                        <Input
                          id="localisationBatiment"
                          placeholder="A"
                          value={newLocalisation.batiment}
                          onChange={(e) => setNewLocalisation({...newLocalisation, batiment: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="localisationEtage">Étage</Label>
                        <Input
                          id="localisationEtage"
                          placeholder="RDC"
                          value={newLocalisation.etage}
                          onChange={(e) => setNewLocalisation({...newLocalisation, etage: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="localisationSalle">Salle</Label>
                        <Input
                          id="localisationSalle"
                          placeholder="101"
                          value={newLocalisation.salle}
                          onChange={(e) => setNewLocalisation({...newLocalisation, salle: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="localisationEtablissement">Établissement</Label>
                        <Select value={newLocalisation.etablissementId} onValueChange={(value) => setNewLocalisation({...newLocalisation, etablissementId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un établissement" />
                          </SelectTrigger>
                          <SelectContent>
                            {etablissements.map((etab) => (
                              <SelectItem key={etab.id} value={etab.id.toString()}>
                                {etab.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="localisationCommentaire">Commentaire</Label>
                        <Textarea
                          id="localisationCommentaire"
                          placeholder="Notes sur la localisation..."
                          value={newLocalisation.commentaire}
                          onChange={(e) => setNewLocalisation({...newLocalisation, commentaire: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddLocalisation(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddLocalisation}>
                        Ajouter la localisation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Base de données</h4>
                  <p className="text-sm text-muted-foreground mb-2">SQLite - Prisma ORM</p>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réinitialiser la base
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Système</h4>
                  <p className="text-sm text-muted-foreground mb-2">Next.js 14 - TypeScript</p>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Redémarrer le serveur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}