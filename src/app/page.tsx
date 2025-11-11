'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    setEditEtablissementData({ nom: '', uai: '', adresse: '', telephone: '', email: '', commentaire: '' });
  };

  const handleUpdateEtablissement = async () => {
    if (!editingEtablissement) return;

    try {
      const response = await fetch(`/api/etablissements/${editingEtablissement.id}`, {
        method: 'PATCH',
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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEquipements = equipements.filter((eq) => {
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="equipements">Équipements</TabsTrigger>
          <TabsTrigger value="modeles">Modèles</TabsTrigger>
          <TabsTrigger value="fabricants">Fabricants</TabsTrigger>
          <TabsTrigger value="etablissements">Établissements</TabsTrigger>
          <TabsTrigger value="administration">Administration</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData && (
            <>
              {/* Stats Cards */}
              <StatsCards data={dashboardData} />
              
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

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Package className="h-6 w-6" />
                      <span>Ajouter équipement</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Server className="h-6 w-6" />
                      <span>Nouveau modèle</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Building className="h-6 w-6" />
                      <span>Nouveau site</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>Importer CSV</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="equipements" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedEtablissement} onValueChange={setSelectedEtablissement}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Établissement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {etablissements.map((etab) => (
                    <SelectItem key={etab.id} value={etab.id.toString()}>
                      {etab.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedFabricant} onValueChange={setSelectedFabricant}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Fabricant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {fabricants.map((fab) => (
                    <SelectItem key={fab.id} value={fab.id.toString()}>{fab.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatut} onValueChange={setSelectedStatut}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {statuts.map((stat) => (
                    <SelectItem key={stat.id} value={stat.id.toString()}>{stat.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showAddEquipment} onOpenChange={setShowAddEquipment}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un équipement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un équipement</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour ajouter un nouvel équipement.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assetTag">Asset Tag</Label>
                    <Input
                      id="assetTag"
                      value={newEquipment.assetTag}
                      onChange={(e) => setNewEquipment({...newEquipment, assetTag: e.target.value})}
                      placeholder="Numéro d'inventaire"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serial">Numéro de série</Label>
                    <Input
                      id="serial"
                      value={newEquipment.serial}
                      onChange={(e) => setNewEquipment({...newEquipment, serial: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modele">Modèle</Label>
                    <Select value={newEquipment.modeleId} onValueChange={(value) => setNewEquipment({...newEquipment, modeleId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
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
                        <SelectValue placeholder="Sélectionner" />
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
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">Aucune</SelectItem>
                        {localisations
                          .filter(loc => loc.etablissementId.toString() === newEquipment.etablissementId || !newEquipment.etablissementId)
                          .map((loc) => (
                          <SelectItem key={loc.id} value={loc.id.toString()}>
                            {loc.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="statut">Statut</Label>
                    <Select value={newEquipment.statutId} onValueChange={(value) => setNewEquipment({...newEquipment, statutId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
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
                    <Label htmlFor="nom">Nom personnalisé</Label>
                    <Input
                      id="nom"
                      value={newEquipment.nom}
                      onChange={(e) => setNewEquipment({...newEquipment, nom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ip">Adresse IP</Label>
                    <Input
                      id="ip"
                      value={newEquipment.ip}
                      onChange={(e) => setNewEquipment({...newEquipment, ip: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mac">Adresse MAC</Label>
                    <Input
                      id="mac"
                      value={newEquipment.mac}
                      onChange={(e) => setNewEquipment({...newEquipment, mac: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reseau">Réseau</Label>
                    <Input
                      id="reseau"
                      value={newEquipment.reseau}
                      onChange={(e) => setNewEquipment({...newEquipment, reseau: e.target.value})}
                      placeholder="PEDA, MGMT, ADMIN..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="hostname">Hostname</Label>
                    <Input
                      id="hostname"
                      value={newEquipment.hostname}
                      onChange={(e) => setNewEquipment({...newEquipment, hostname: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="os">Système d'exploitation</Label>
                    <Input
                      id="os"
                      value={newEquipment.os}
                      onChange={(e) => setNewEquipment({...newEquipment, os: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="versionOs">Version OS</Label>
                    <Input
                      id="versionOs"
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
                    <Label htmlFor="dateGarantie">Fin de garantie</Label>
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
                      step="0.01"
                      value={newEquipment.prix}
                      onChange={(e) => setNewEquipment({...newEquipment, prix: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fournisseur">Fournisseur</Label>
                    <Input
                      id="fournisseur"
                      value={newEquipment.fournisseur}
                      onChange={(e) => setNewEquipment({...newEquipment, fournisseur: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facture">Facture</Label>
                    <Input
                      id="facture"
                      value={newEquipment.facture}
                      onChange={(e) => setNewEquipment({...newEquipment, facture: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newEquipment.notes}
                      onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="commentaire">Commentaires techniques</Label>
                    <Textarea
                      id="commentaire"
                      value={newEquipment.commentaire}
                      onChange={(e) => setNewEquipment({...newEquipment, commentaire: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddEquipment(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEquipment}>
                    Ajouter
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
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Modèle</TableHead>
                    <TableHead>Établissement</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Prix</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipements.map((eq) => {
                    const Icon = getCategoryIcon(eq.modele.categorie.icone);
                    return (
                      <TableRow key={eq.id}>
                        <TableCell className="font-mono">{eq.assetTag || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {eq.nom || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{eq.modele.nom}</p>
                            <p className="text-sm text-muted-foreground">{eq.modele.fabricant.nom}</p>
                          </div>
                        </TableCell>
                        <TableCell>{eq.etablissement.nom}</TableCell>
                        <TableCell>
                          {eq.localisation ? (
                            <div>
                              <p className="font-medium">{eq.localisation.nom}</p>
                              <p className="text-sm text-muted-foreground">
                                {eq.localisation.batiment} {eq.localisation.etage} {eq.localisation.salle}
                              </p>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="font-mono">{eq.ip || '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            style={{ backgroundColor: getStatusColor(eq.statut.couleur), color: 'white' }}
                          >
                            {eq.statut.nom}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {eq.prix ? `${eq.prix.toLocaleString('fr-FR')} €` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modeles" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Modèles d'équipements</h2>
            <Dialog open={showAddModele} onOpenChange={setShowAddModele}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un modèle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un modèle</DialogTitle>
                  <DialogDescription>
                    Créer un nouveau modèle d'équipement.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomModele">Nom du modèle</Label>
                    <Input
                      id="nomModele"
                      value={newModele.nom}
                      onChange={(e) => setNewModele({...newModele, nom: e.target.value})}
                      placeholder="PowerEdge R740"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numeroModele">Numéro/Référence</Label>
                    <Input
                      id="numeroModele"
                      value={newModele.numero}
                      onChange={(e) => setNewModele({...newModele, numero: e.target.value})}
                      placeholder="R740-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabricantModele">Fabricant</Label>
                    <Select value={newModele.fabricantId} onValueChange={(value) => setNewModele({...newModele, fabricantId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
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
                    <Label htmlFor="categorieModele">Catégorie</Label>
                    <Select value={newModele.categorieId} onValueChange={(value) => setNewModele({...newModele, categorieId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
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
                    <Label htmlFor="descriptionModele">Description</Label>
                    <Textarea
                      id="descriptionModele"
                      value={newModele.description}
                      onChange={(e) => setNewModele({...newModele, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddModele(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddModele}>
                    Ajouter
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
                      <Icon className="h-5 w-5" />
                      {modele.nom}
                    </CardTitle>
                    <CardDescription>
                      {modele.fabricant.nom} • {modele.numero}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Catégorie:</span>
                        <Badge variant="secondary">{modele.categorie.nom}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Équipements:</span>
                        <Badge variant="outline">{modele._count.equipements}</Badge>
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
        </TabsContent>

        <TabsContent value="fabricants" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Fabricants</h2>
            <Dialog open={showAddFabricant} onOpenChange={setShowAddFabricant}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un fabricant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un fabricant</DialogTitle>
                  <DialogDescription>
                    Ajouter un nouveau fabricant d'équipements.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomFabricant">Nom</Label>
                    <Input
                      id="nomFabricant"
                      value={newFabricant.nom}
                      onChange={(e) => setNewFabricant({...newFabricant, nom: e.target.value})}
                      placeholder="Dell"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urlFabricant">Site web</Label>
                    <Input
                      id="urlFabricant"
                      value={newFabricant.url}
                      onChange={(e) => setNewFabricant({...newFabricant, url: e.target.value})}
                      placeholder="https://www.dell.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportFabricant">Support</Label>
                    <Input
                      id="supportFabricant"
                      value={newFabricant.support}
                      onChange={(e) => setNewFabricant({...newFabricant, support: e.target.value})}
                      placeholder="support@dell.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commentaireFabricant">Commentaire</Label>
                    <Textarea
                      id="commentaireFabricant"
                      value={newFabricant.commentaire}
                      onChange={(e) => setNewFabricant({...newFabricant, commentaire: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddFabricant(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddFabricant}>
                    Ajouter
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
                      <a href={fabricant.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
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
                      <p className="text-sm text-muted-foreground">
                        Support: {fabricant.support}
                      </p>
                    )}
                    {fabricant.commentaire && (
                      <p className="text-sm text-muted-foreground mt-2">{fabricant.commentaire}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="etablissements" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Établissements</h2>
            <Dialog open={showAddEtablissement} onOpenChange={setShowAddEtablissement}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un établissement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un établissement</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour ajouter un nouvel établissement.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomEtablissement">Nom</Label>
                    <Input
                      id="nomEtablissement"
                      value={newEtablissement.nom}
                      onChange={(e) => setNewEtablissement({...newEtablissement, nom: e.target.value})}
                      placeholder="Nom de l'établissement"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uaiEtablissement">UAI</Label>
                    <Input
                      id="uaiEtablissement"
                      value={newEtablissement.uai}
                      onChange={(e) => setNewEtablissement({...newEtablissement, uai: e.target.value})}
                      placeholder="Code UAI"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adresseEtablissement">Adresse</Label>
                    <Input
                      id="adresseEtablissement"
                      value={newEtablissement.adresse}
                      onChange={(e) => setNewEtablissement({...newEtablissement, adresse: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephoneEtablissement">Téléphone</Label>
                    <Input
                      id="telephoneEtablissement"
                      value={newEtablissement.telephone}
                      onChange={(e) => setNewEtablissement({...newEtablissement, telephone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailEtablissement">Email</Label>
                    <Input
                      id="emailEtablissement"
                      type="email"
                      value={newEtablissement.email}
                      onChange={(e) => setNewEtablissement({...newEtablissement, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commentaireEtablissement">Commentaire</Label>
                    <Textarea
                      id="commentaireEtablissement"
                      value={newEtablissement.commentaire}
                      onChange={(e) => setNewEtablissement({...newEtablissement, commentaire: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddEtablissement(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEtablissement}>
                    Ajouter
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
                    <CardDescription>UAI: {etab.uai}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Équipements:</span>
                      <Badge variant="secondary">{etab._count.equipements}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Localisations:</span>
                      <Badge variant="outline">{etab._count.localisations}</Badge>
                    </div>
                    {etab.adresse && (
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {etab.adresse}
                      </p>
                    )}
                    {etab.telephone && (
                      <p className="text-sm text-muted-foreground">{etab.telephone}</p>
                    )}
                    {etab.email && (
                      <p className="text-sm text-muted-foreground">{etab.email}</p>
                    )}
                    {etab.commentaire && (
                      <p className="text-sm text-muted-foreground mt-2">{etab.commentaire}</p>
                    )}
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
            {editingEtablissement && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier l'établissement</DialogTitle>
                  <DialogDescription>
                    Mettez à jour les informations de l'établissement sélectionné.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editNomEtablissement">Nom</Label>
                    <Input
                      id="editNomEtablissement"
                      value={editEtablissementData.nom}
                      onChange={(e) => setEditEtablissementData({ ...editEtablissementData, nom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editUaiEtablissement">UAI</Label>
                    <Input
                      id="editUaiEtablissement"
                      value={editEtablissementData.uai}
                      onChange={(e) => setEditEtablissementData({ ...editEtablissementData, uai: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editAdresseEtablissement">Adresse</Label>
                    <Input
                      id="editAdresseEtablissement"
                      value={editEtablissementData.adresse}
                      onChange={(e) => setEditEtablissementData({ ...editEtablissementData, adresse: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editTelephoneEtablissement">Téléphone</Label>
                    <Input
                      id="editTelephoneEtablissement"
                      value={editEtablissementData.telephone}
                      onChange={(e) => setEditEtablissementData({ ...editEtablissementData, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEmailEtablissement">Email</Label>
                    <Input
                      id="editEmailEtablissement"
                      type="email"
                      value={editEtablissementData.email}
                      onChange={(e) => setEditEtablissementData({ ...editEtablissementData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCommentaireEtablissement">Commentaire</Label>
                    <Textarea
                      id="editCommentaireEtablissement"
                      value={editEtablissementData.commentaire}
                      onChange={(e) =>
                        setEditEtablissementData({ ...editEtablissementData, commentaire: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={resetEditEtablissement}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpdateEtablissement}>Enregistrer</Button>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </TabsContent>

        <TabsContent value="administration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Catégories
                </CardTitle>
                <CardDescription>
                  Gérez les catégories d'équipements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.icone);
                    return (
                      <div key={cat.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{cat.nom}</span>
                        </div>
                        <Badge variant="secondary">{cat._count.modeles} modèles</Badge>
                      </div>
                    );
                  })}
                </div>
                <Dialog open={showAddCategorie} onOpenChange={setShowAddCategorie}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une catégorie
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une catégorie</DialogTitle>
                      <DialogDescription>
                        Créer une nouvelle catégorie d'équipements.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomCategorie">Nom</Label>
                        <Input
                          id="nomCategorie"
                          value={newCategorie.nom}
                          onChange={(e) => setNewCategorie({...newCategorie, nom: e.target.value})}
                          placeholder="Serveurs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="iconeCategorie">Icône</Label>
                        <Select value={newCategorie.icone} onValueChange={(value) => setNewCategorie({...newCategorie, icone: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une icône" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Server">Serveur</SelectItem>
                            <SelectItem value="Router">Routeur</SelectItem>
                            <SelectItem value="Wifi">WiFi</SelectItem>
                            <SelectItem value="Camera">Caméra</SelectItem>
                            <SelectItem value="HardDrive">Stockage</SelectItem>
                            <SelectItem value="Battery">Onduleur</SelectItem>
                            <SelectItem value="Monitor">Moniteur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="descriptionCategorie">Description</Label>
                        <Textarea
                          id="descriptionCategorie"
                          value={newCategorie.description}
                          onChange={(e) => setNewCategorie({...newCategorie, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddCategorie(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddCategorie}>
                        Ajouter
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Statuts
                </CardTitle>
                <CardDescription>
                  Gérez les statuts des équipements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statuts.map((stat) => (
                    <div key={stat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStatusColor(stat.couleur) }}
                        />
                        <span className="font-medium">{stat.nom}</span>
                      </div>
                      <Badge variant="outline">{stat._count.equipements} équipements</Badge>
                    </div>
                  ))}
                </div>
                <Dialog open={showAddStatut} onOpenChange={setShowAddStatut}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un statut
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un statut</DialogTitle>
                      <DialogDescription>
                        Créer un nouveau statut pour les équipements.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomStatut">Nom</Label>
                        <Input
                          id="nomStatut"
                          value={newStatut.nom}
                          onChange={(e) => setNewStatut({...newStatut, nom: e.target.value})}
                          placeholder="Déployé"
                        />
                      </div>
                      <div>
                        <Label htmlFor="typeStatut">Type</Label>
                        <Select value={newStatut.type} onValueChange={(value) => setNewStatut({...newStatut, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deployable">Déployable</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="archived">Archivé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="couleurStatut">Couleur</Label>
                        <Input
                          id="couleurStatut"
                          type="color"
                          value={newStatut.couleur}
                          onChange={(e) => setNewStatut({...newStatut, couleur: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="descriptionStatut">Description</Label>
                        <Textarea
                          id="descriptionStatut"
                          value={newStatut.description}
                          onChange={(e) => setNewStatut({...newStatut, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddStatut(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddStatut}>
                        Ajouter
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisations
                </CardTitle>
                <CardDescription>
                  Gérez les localisations physiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {localisations.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{loc.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          {loc.etablissement.nom} • {loc.batiment} {loc.etage} {loc.salle}
                        </p>
                      </div>
                      <Badge variant="outline">{loc._count.equipements}</Badge>
                    </div>
                  ))}
                </div>
                <Dialog open={showAddLocalisation} onOpenChange={setShowAddLocalisation}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une localisation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une localisation</DialogTitle>
                      <DialogDescription>
                        Créer une nouvelle localisation physique.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nomLocalisation">Nom</Label>
                        <Input
                          id="nomLocalisation"
                          value={newLocalisation.nom}
                          onChange={(e) => setNewLocalisation({...newLocalisation, nom: e.target.value})}
                          placeholder="Salle Serveurs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="etablissementLocalisation">Établissement</Label>
                        <Select value={newLocalisation.etablissementId} onValueChange={(value) => setNewLocalisation({...newLocalisation, etablissementId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
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
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="batimentLocalisation">Bâtiment</Label>
                          <Input
                            id="batimentLocalisation"
                            value={newLocalisation.batiment}
                            onChange={(e) => setNewLocalisation({...newLocalisation, batiment: e.target.value})}
                            placeholder="A"
                          />
                        </div>
                        <div>
                          <Label htmlFor="etageLocalisation">Étage</Label>
                          <Input
                            id="etageLocalisation"
                            value={newLocalisation.etage}
                            onChange={(e) => setNewLocalisation({...newLocalisation, etage: e.target.value})}
                            placeholder="RDC"
                          />
                        </div>
                        <div>
                          <Label htmlFor="salleLocalisation">Salle</Label>
                          <Input
                            id="salleLocalisation"
                            value={newLocalisation.salle}
                            onChange={(e) => setNewLocalisation({...newLocalisation, salle: e.target.value})}
                            placeholder="001"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="commentaireLocalisation">Commentaire</Label>
                        <Textarea
                          id="commentaireLocalisation"
                          value={newLocalisation.commentaire}
                          onChange={(e) => setNewLocalisation({...newLocalisation, commentaire: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddLocalisation(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddLocalisation}>
                        Ajouter
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Supervision
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble de la supervision réseau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData?.supervisionTotals._sum.switchFederateur || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Switchs Fédérateurs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData?.supervisionTotals._sum.switchExtremite || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Switchs Extrémité</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {dashboardData?.supervisionTotals._sum.bornesWifi || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Bornes WiFi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {dashboardData?.supervisionTotals._sum.serveursPhysiques || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Serveurs Physiques</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}