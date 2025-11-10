import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Clear existing data
    await db.historiqueEquipement.deleteMany();
    await db.maintenance.deleteMany();
    await db.equipement.deleteMany();
    await db.supervision.deleteMany();
    await db.localisation.deleteMany();
    await db.etablissement.deleteMany();
    await db.modele.deleteMany();
    await db.statut.deleteMany();
    await db.categorie.deleteMany();
    await db.fabricant.deleteMany();

    // Create categories
    const categories = await Promise.all([
      db.categorie.create({
        data: { nom: 'Serveurs', icone: 'Server', description: 'Serveurs physiques et virtuels' },
      }),
      db.categorie.create({
        data: { nom: 'Réseau - Switch', icone: 'Router', description: 'Switchs réseau et équipements actifs' },
      }),
      db.categorie.create({
        data: { nom: 'WiFi', icone: 'Wifi', description: 'Bornes WiFi et contrôleurs' },
      }),
      db.categorie.create({
        data: { nom: 'UPS', icone: 'Battery', description: 'Onduleurs et alimentations secourues' },
      }),
      db.categorie.create({
        data: { nom: 'Divers', icone: 'Package', description: 'Équipements divers et non classifiés' },
      }),
      db.categorie.create({
        data: { nom: 'Stockage', icone: 'HardDrive', description: 'NAS, SAN et stockage' },
      }),
    ]);

    // Create manufacturers from both CSV files
    const fabricants = await Promise.all([
      db.fabricant.create({ data: { nom: 'Dell', url: 'https://www.dell.com' } }),
      db.fabricant.create({ data: { nom: 'Aruba', url: 'https://www.arubanetworks.com' } }),
      db.fabricant.create({ data: { nom: 'Microsoft', url: 'https://www.microsoft.com' } }),
      db.fabricant.create({ data: { nom: 'QNAP', url: 'https://www.qnap.com' } }),
      db.fabricant.create({ data: { nom: 'VMware', url: 'https://www.vmware.com' } }),
      db.fabricant.create({ data: { nom: 'Allied Telesis', url: 'https://www.alliedtelesis.com' } }),
      db.fabricant.create({ data: { nom: 'Cisco', url: 'https://www.cisco.com' } }),
      db.fabricant.create({ data: { nom: 'Eaton', url: 'https://www.eaton.com' } }),
      db.fabricant.create({ data: { nom: 'Debian', url: 'https://www.debian.org' } }),
      db.fabricant.create({ data: { nom: 'Ubuntu', url: 'https://www.ubuntu.com' } }),
      db.fabricant.create({ data: { nom: 'HPE', url: 'https://www.hpe.com' } }),
    ]);

    // Create statuses
    const statuts = await Promise.all([
      db.statut.create({ 
        data: { 
          nom: 'Déployé', 
          type: 'deployable', 
          couleur: '#22c55e',
          description: 'Équipement en service et fonctionnel'
        } 
      }),
      db.statut.create({ 
        data: { 
          nom: 'En attente', 
          type: 'pending', 
          couleur: '#f59e0b',
          description: 'Équipement en attente de déploiement'
        } 
      }),
      db.statut.create({ 
        data: { 
          nom: 'En maintenance', 
          type: 'maintenance', 
          couleur: '#3b82f6',
          description: 'Équipement en cours de maintenance'
        } 
      }),
      db.statut.create({ 
        data: { 
          nom: 'Archivé', 
          type: 'archived', 
          couleur: '#6b7280',
          description: 'Équipement hors service'
        } 
      }),
    ]);

    // Create models from CSV data
    const modeles = await Promise.all([
      // Switches Aruba
      db.modele.create({
        data: {
          nom: 'GS924MX',
          numero: 'GS924MX',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba GS924MX',
        },
      }),
      db.modele.create({
        data: {
          nom: 'x510L-28GT',
          numero: 'x510L-28GT',
          fabricantId: fabricants[5].id, // Allied Telesis
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Allied Telesis x510L-28GT',
        },
      }),
      db.modele.create({
        data: {
          nom: 'x230-10GP',
          numero: 'x230-10GP',
          fabricantId: fabricants[5].id, // Allied Telesis
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Allied Telesis x230-10GP',
        },
      }),
      db.modele.create({
        data: {
          nom: 'GS980MX/28PSm',
          numero: 'GS980MX/28PSm',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba GS980MX/28PSm PoE',
        },
      }),
      db.modele.create({
        data: {
          nom: 'GS970M/10',
          numero: 'GS970M/10',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba GS970M/10',
        },
      }),
      db.modele.create({
        data: {
          nom: 'GS948MX',
          numero: 'GS948MX',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba GS948MX',
        },
      }),
      db.modele.create({
        data: {
          nom: 'GS948MPX',
          numero: 'GS948MPX',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba GS948MPX',
        },
      }),
      db.modele.create({
        data: {
          nom: 'GS924MPX',
          numero: 'GS924MPX',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba GS924MPX',
        },
      }),
      db.modele.create({
        data: {
          nom: 'x930-28GSTX',
          numero: 'x930-28GSTX',
          fabricantId: fabricants[5].id, // Allied Telesis
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Allied Telesis x930-28GSTX',
        },
      }),
      db.modele.create({
        data: {
          nom: 'FlexNetwork 5520-24G-SFP-4SFPP HI',
          numero: '5520-24G-SFP-4SFPP HI',
          fabricantId: fabricants[5].id, // Allied Telesis
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Allied Telesis FlexNetwork 5520-24G-SFP-4SFPP HI',
        },
      }),
      db.modele.create({
        data: {
          nom: 'FlexNetwork 5140-48G-PoE+-4SFP+ EI',
          numero: '5140-48G-PoE+-4SFP+ EI',
          fabricantId: fabricants[5].id, // Allied Telesis
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Allied Telesis FlexNetwork 5140-48G-PoE+-4SFP+ EI',
        },
      }),
      db.modele.create({
        data: {
          nom: 'FlexNetwork 5140-24G-PoE+-4SFP+ EI',
          numero: '5140-24G-PoE+-4SFP+ EI',
          fabricantId: fabricants[5].id, // Allied Telesis
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Allied Telesis FlexNetwork 5140-24G-PoE+-4SFP+ EI',
        },
      }),
      db.modele.create({
        data: {
          nom: 'Aruba 2930F-8G-PoE+-2SFP+',
          numero: '2930F-8G-PoE+-2SFP+',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba 2930F-8G-PoE+-2SFP+',
        },
      }),
      db.modele.create({
        data: {
          nom: 'Aruba 2930F-48G-PoE+-4SFP+',
          numero: '2930F-48G-PoE+-4SFP+',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba 2930F-48G-PoE+-4SFP+',
        },
      }),
      db.modele.create({
        data: {
          nom: 'Aruba 2930F-48G-4SFP+',
          numero: '2930F-48G-4SFP+',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba 2930F-48G-4SFP+',
        },
      }),
      db.modele.create({
        data: {
          nom: 'Aruba 2930F-24G-PoE+-4SFP+',
          numero: '2930F-24G-PoE+-4SFP+',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba 2930F-24G-PoE+-4SFP+',
        },
      }),
      db.modele.create({
        data: {
          nom: 'Aruba 2930F-24G-4SFP+',
          numero: '2930F-24G-4SFP+',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba 2930F-24G-4SFP+',
        },
      }),
      db.modele.create({
        data: {
          nom: 'Aruba 2530-24G-PoE+',
          numero: '2530-24G-PoE+',
          fabricantId: fabricants[1].id, // Aruba
          categorieId: categories[1].id, // Réseau - Switch
          description: 'Switch Aruba 2530-24G-PoE+',
        },
      }),
      
      // UPS Eaton
      db.modele.create({
        data: {
          nom: '9SX6KIRT',
          numero: '9SX6KIRT',
          fabricantId: fabricants[7].id, // Eaton
          categorieId: categories[3].id, // UPS
          description: 'Onduleur Eaton 9SX6KIRT',
        },
      }),
      db.modele.create({
        data: {
          nom: '9PX11KiRTNBP31',
          numero: '9PX11KiRTNBP31',
          fabricantId: fabricants[7].id, // Eaton
          categorieId: categories[3].id, // UPS
          description: 'Onduleur Eaton 9PX11KiRTNBP31',
        },
      }),
      db.modele.create({
        data: {
          nom: '9PX11KiRTNBP',
          numero: '9PX11KiRTNBP',
          fabricantId: fabricants[7].id, // Eaton
          categorieId: categories[3].id, // UPS
          description: 'Onduleur Eaton 9PX11KiRTNBP',
        },
      }),
      db.modele.create({
        data: {
          nom: '5PX3000IRT2U',
          numero: '5PX3000IRT2U',
          fabricantId: fabricants[7].id, // Eaton
          categorieId: categories[3].id, // UPS
          description: 'Onduleur Eaton 5PX3000IRT2U',
        },
      }),
      
      // WiFi Cisco
      db.modele.create({
        data: {
          nom: 'Aironet 1702I-E-K9',
          numero: '1702I-E-K9',
          fabricantId: fabricants[6].id, // Cisco
          categorieId: categories[2].id, // WiFi
          description: 'Borne WiFi Cisco Aironet 1702I-E-K9',
        },
      }),
      
      // Serveur Dell
      db.modele.create({
        data: {
          nom: 'PowerEdge R750xs',
          numero: 'R750xs',
          fabricantId: fabricants[0].id, // Dell
          categorieId: categories[0].id, // Serveurs
          description: 'Serveur Dell PowerEdge R750xs',
        },
      }),
      
      // Divers
      db.modele.create({
        data: {
          nom: 'divers',
          numero: '',
          fabricantId: fabricants[10].id, // HPE (comme fabricant par défaut)
          categorieId: categories[4].id, // Divers
          description: 'Équipements divers non classifiés',
        },
      }),
    ]);

    // Create establishments
    const etablissements = await Promise.all([
      db.etablissement.create({
        data: { 
          nom: 'VAROQUAUX', 
          uai: '0540044E',
          adresse: '1 Rue de l\'École',
          telephone: '03 20 00 00 01',
          email: 'contact@varoquaux.edu',
        },
      }),
      db.etablissement.create({
        data: { 
          nom: 'MARQUETTE', 
          uai: '0540058V',
          adresse: '2 Rue du Collège',
          telephone: '03 20 00 00 02',
          email: 'contact@marquette.edu',
        },
      }),
      db.etablissement.create({
        data: { 
          nom: 'HERE', 
          uai: '0542262R',
          adresse: '3 Rue du Lycée',
          telephone: '03 20 00 00 03',
          email: 'contact@here.edu',
        },
      }),
      db.etablissement.create({
        data: { 
          nom: 'POINCARE', 
          uai: '0540038Y',
          adresse: '4 Avenue Henri Poincaré',
          telephone: '03 20 00 00 04',
          email: 'contact@poincare.edu',
        },
      }),
    ]);

    // Create locations
    const localisations = await Promise.all([
      db.localisation.create({
        data: { 
          nom: 'Salle Serveurs',
          batiment: 'A',
          etage: 'RDC',
          salle: '001',
          etablissementId: etablissements[0].id,
        },
      }),
      db.localisation.create({
        data: { 
          nom: 'Baie Réseau Principale',
          batiment: 'B',
          etage: '1er',
          salle: '101',
          etablissementId: etablissements[0].id,
        },
      }),
      db.localisation.create({
        data: { 
          nom: 'Local Technique',
          batiment: 'A',
          etage: 'RDC',
          salle: '002',
          etablissementId: etablissements[1].id,
        },
      }),
      db.localisation.create({
        data: { 
          nom: 'Salle 203',
          batiment: 'C',
          etage: '2ème',
          salle: '203',
          etablissementId: etablissements[2].id,
        },
      }),
      db.localisation.create({
        data: { 
          nom: 'Baie Étage 1',
          batiment: 'B',
          etage: '1er',
          salle: '105',
          etablissementId: etablissements[3].id,
        },
      }),
    ]);

    // Create equipment using models from CSV
    const equipements = [
      {
        assetTag: 'EQ-001',
        serial: 'DL-R750-001',
        modeleId: modeles[21].id, // Dell PowerEdge R750xs
        etablissementId: etablissements[0].id,
        localisationId: localisations[0].id,
        statutId: statuts[0].id, // Déployé
        nom: 'Serveur Principal VAROQUAUX',
        ip: '172.17.1.7',
        mac: '00:11:22:33:44:55',
        reseau: 'PEDA',
        hostname: 'SRV-MAIN-VARO',
        os: 'Windows Server',
        versionOs: '2022',
        dateAchat: '2023-01-15',
        dateGarantie: '2026-01-15',
        prix: 4500.00,
        fournisseur: 'Dell France',
        notes: 'Serveur principal pour les applications pédagogiques',
      },
      {
        assetTag: 'EQ-002',
        serial: 'AR-924MX-001',
        modeleId: modeles[0].id, // Aruba GS924MX
        etablissementId: etablissements[0].id,
        localisationId: localisations[1].id,
        statutId: statuts[0].id, // Déployé
        nom: 'Switch Principal VAROQUAUX',
        ip: '192.168.1.1',
        mac: 'AA:BB:CC:DD:EE:01',
        reseau: 'MGMT',
        hostname: 'SW-MAIN-VARO',
        os: 'ArubaOS-CX',
        versionOs: '10.09',
        dateAchat: '2023-03-20',
        dateGarantie: '2026-03-20',
        prix: 2800.00,
        fournisseur: 'Aruba Networks',
        notes: 'Switch fédérateur principal',
      },
      {
        assetTag: 'EQ-003',
        serial: 'AT-5140-001',
        modeleId: modeles[10].id, // FlexNetwork 5140-48G-PoE+-4SFP+ EI
        etablissementId: etablissements[1].id,
        localisationId: localisations[2].id,
        statutId: statuts[0].id, // Déployé
        nom: 'Switch PoE MARQUETTE',
        ip: '192.168.2.1',
        mac: 'AA:BB:CC:DD:EE:02',
        reseau: 'MGMT',
        hostname: 'SW-POE-MARQ',
        os: 'AlliedWare Plus',
        versionOs: '5.4.8',
        dateAchat: '2023-06-10',
        dateGarantie: '2026-06-10',
        prix: 3200.00,
        fournisseur: 'Allied Telesis',
        notes: 'Switch avec PoE pour les bornes WiFi',
      },
      {
        assetTag: 'EQ-004',
        serial: 'CISCO-1702-001',
        modeleId: modeles[20].id, // Cisco Aironet 1702I-E-K9
        etablissementId: etablissements[2].id,
        localisationId: localisations[3].id,
        statutId: statuts[0].id, // Déployé
        nom: 'Borne WiFi Salle 203',
        ip: '172.17.50.10',
        mac: '00:AA:CC:11:22:33',
        reseau: 'PEDA',
        hostname: 'AP-203-HERE',
        os: 'Cisco IOS',
        versionOs: '15.3(3)JAB',
        dateAchat: '2023-08-15',
        dateGarantie: '2026-08-15',
        prix: 650.00,
        fournisseur: 'Cisco Systems',
        notes: 'Borne WiFi pour la salle 203',
      },
      {
        assetTag: 'EQ-005',
        serial: 'EATON-9SX-001',
        modeleId: modeles[16].id, // Eaton 9SX6KIRT
        etablissementId: etablissements[0].id,
        localisationId: localisations[0].id,
        statutId: statuts[0].id, // Déployé
        nom: 'Onduleur Serveurs VAROQUAUX',
        ip: '192.168.1.254',
        mac: 'BB:CC:DD:EE:FF:01',
        reseau: 'MGMT',
        hostname: 'UPS-SRV-VARO',
        os: 'Eaton Intelligent Power Manager',
        versionOs: '1.7',
        dateAchat: '2023-02-28',
        dateGarantie: '2026-02-28',
        prix: 1800.00,
        fournisseur: 'Eaton France',
        notes: 'Onduleur pour les serveurs principaux',
      },
      {
        assetTag: 'EQ-006',
        serial: 'AR-2930F-001',
        modeleId: modeles[13].id, // Aruba 2930F-24G-PoE+-4SFP+
        etablissementId: etablissements[3].id,
        localisationId: localisations[4].id,
        statutId: statuts[0].id, // Déployé
        nom: 'Switch Étage 1 POINCARE',
        ip: '192.168.4.10',
        mac: 'CC:DD:EE:FF:AA:01',
        reseau: 'MGMT',
        hostname: 'SW-ET1-POIN',
        os: 'ArubaOS-Switch',
        versionOs: '16.10',
        dateAchat: '2023-09-20',
        dateGarantie: '2026-09-20',
        prix: 1500.00,
        fournisseur: 'Aruba Networks',
        notes: 'Switch d\'étage avec PoE',
      },
      {
        assetTag: 'EQ-007',
        serial: 'EATON-5PX-001',
        modeleId: modeles[19].id, // Eaton 5PX3000IRT2U
        etablissementId: etablissements[1].id,
        localisationId: localisations[2].id,
        statutId: statuts[0].id, // Déployé
        nom: 'Onduleur Réseau MARQUETTE',
        ip: '192.168.2.254',
        mac: 'DD:EE:FF:AA:BB:01',
        reseau: 'MGMT',
        hostname: 'UPS-RES-MARQ',
        os: 'Eaton Intelligent Power Protector',
        versionOs: '2.5',
        dateAchat: '2023-07-10',
        dateGarantie: '2026-07-10',
        prix: 1200.00,
        fournisseur: 'Eaton France',
        notes: 'Onduleur pour équipements réseau',
      },
    ];

    await Promise.all(
      equipements.map((eq) => db.equipement.create({ data: eq }))
    );

    // Create supervision data
    const supervisions = [
      {
        etablissementId: etablissements[0].id,
        switchFederateur: 3,
        switchExtremite: 28,
        bornesWifi: 61,
        gtcGtb: 10,
        serveursPhysiques: 3,
        nbVm: 8,
        nbPostes: 430,
        commentaire: 'Supervision complète VAROQUAUX',
      },
      {
        etablissementId: etablissements[1].id,
        switchFederateur: 4,
        switchExtremite: 38,
        bornesWifi: 70,
        gtcGtb: 12,
        serveursPhysiques: 4,
        nbVm: 10,
        nbPostes: 500,
        commentaire: 'Supervision complète MARQUETTE',
      },
      {
        etablissementId: etablissements[2].id,
        switchFederateur: 3,
        switchExtremite: 42,
        bornesWifi: 80,
        gtcGtb: 8,
        serveursPhysiques: 3,
        nbVm: 7,
        nbPostes: 240,
        commentaire: 'Supervision complète HERE',
      },
      {
        etablissementId: etablissements[3].id,
        switchFederateur: 3,
        switchExtremite: 36,
        bornesWifi: 95,
        gtcGtb: 9,
        serveursPhysiques: 2,
        nbVm: 6,
        nbPostes: 320,
        commentaire: 'Supervision complète POINCARE',
      },
    ];

    await Promise.all(
      supervisions.map((sup) => db.supervision.create({ data: sup }))
    );

    return NextResponse.json({ 
      message: 'Database seeded successfully with CSV models',
      count: {
        fabricants: fabricants.length,
        categories: categories.length,
        modeles: modeles.length,
        statuts: statuts.length,
        etablissements: etablissements.length,
        localisations: localisations.length,
        equipements: equipements.length,
        supervisions: supervisions.length,
      },
      models: {
        switches: modeles.filter(m => m.categorieId === categories[1].id).length,
        ups: modeles.filter(m => m.categorieId === categories[3].id).length,
        wifi: modeles.filter(m => m.categorieId === categories[2].id).length,
        servers: modeles.filter(m => m.categorieId === categories[0].id).length,
        divers: modeles.filter(m => m.categorieId === categories[4].id).length,
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}