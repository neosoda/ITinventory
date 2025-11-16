# IT Inventory - Gestion de parc informatique

Une plateforme moderne et inspirée de Snipe-IT pour la gestion de parc informatique, développée avec Next.js, Prisma et Tailwind CSS.

## 🚀 Caractéristiques

- **Interface moderne** - Design inspiré de Snipe-IT avec sidebar et navigation intuitive
- **Gestion complète** - Équipements, modèles, fabricants, établissements, localisations
- **Temps réel** - Hot-reload et mises à jour instantanées
- **Responsive** - Interface adaptée aux mobiles et desktop
- **TypeScript** - Développement sécurisé avec typage fort
- **Base de données** - Prisma avec SQLite pour une configuration simple

## 🛠️ Prérequis

- Node.js 18+ 
- npm ou yarn

## 📦 Installation

1. Clonez le repository :
```bash
git clone <repository-url>
cd ITinventory
```

2. Installez les dépendances :
```bash
npm install
```

3. Générez le client Prisma :
```bash
npx prisma generate
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

L'application sera disponible à l'adresse : http://localhost:3000

## 🔧 Configuration

### Base de données

Le projet utilise SQLite par défaut pour une configuration simple. La base de données est créée automatiquement.

Pour initialiser les données de démonstration :
```bash
curl -X POST http://localhost:3000/api/seed
```

### Fabricants disponibles

Les fabricants suivants sont déjà configurés :
- Cisco
- Allied Telesis  
- HP
- HP Aruba
- Eaton
- Dell
- Vmware
- Microsoft
- Linux

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js
│   ├── api/               # API routes
│   │   ├── fabricants/    # Gestion des fabricants
│   │   ├── modeles/       # Gestion des modèles
│   │   ├── equipements/   # Gestion des équipements
│   │   └── ...
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── layout/           # Layout components
│   ├── ui/               # UI components (shadcn/ui)
│   └── dashboard/        # Composants dashboard
├── lib/                  # Utilitaires
│   ├── db.ts            # Configuration Prisma
│   └── utils.ts         # Fonctions utilitaires
└── prisma/              # Schéma de base de données
    └── schema.prisma
```

## 🎯 Fonctionnalités principales

### Dashboard
- Vue d'ensemble statistique
- Équipements récents
- Statut des équipements
- Actions rapides

### Gestion des équipements
- Ajouter/modifier/supprimer des équipements
- Recherche et filtrage
- Gestion des statuts
- Suivi des localisations

### Catalogue
- Gestion des modèles
- Fiche détaillée des équipements
- Historique des modifications

### Administration
- Gestion des établissements
- Gestion des localisations
- Gestion des catégories
- Gestion des statuts

## 🚀 Scripts disponibles

```bash
npm run dev          # Lancer le serveur de développement
npm run build        # Construire l'application pour la production
npm run start        # Lancer en production
npm run lint         # Linter le code
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser les changements à la base de données
```

## 🔍 Développement

### Ajouter de nouveaux fabricants

Vous pouvez ajouter des fabricants via l'API :
```bash
curl -X POST http://localhost:3000/api/fabricants \
  -H "Content-Type: application/json" \
  -d '{"nom":"Nouveau Fabricant"}'
```

Ou utiliser le script fourni :
```bash
node add-fabricants.js
```

### Personnalisation

- **Thème** - Modifiez les couleurs dans `tailwind.config.ts`
- **Composants** - Les composants UI sont dans `src/components/ui/`
- **API** - Les endpoints sont dans `src/app/api/`

## 🐛 Dépannage

### Problèmes courants

1. **Prisma non généré** : Exécutez `npx prisma generate`
2. **Port déjà utilisée** : Changez le port dans `server.ts`
3. **Base de données vide** : Initialisez avec `curl -X POST http://localhost:3000/api/seed`

### Logs

Les logs de développement sont disponibles dans `dev.log`.

## 📄 Licence

Ce projet est open source. Consultez le fichier LICENSE pour plus d'informations.

## 🤝 Contribuer

1. Fork le projet
2. Créez une branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez un Pull Request

## ⬆️ Pousser les changements sur GitHub

Si vous travaillez directement sur ce dépôt et souhaitez pousser votre travail sur GitHub, voici un rappel des étapes essentielles :

1. **Vérifiez l'état du dépôt**
   ```bash
   git status
   ```
2. **Ajoutez les fichiers modifiés**
   ```bash
   git add <fichier> # ou git add . pour tout ajouter
   ```
3. **Créez un commit explicite**
   ```bash
   git commit -m "Description courte et claire"
   ```
4. **Définissez le dépôt distant si nécessaire**
   ```bash
   git remote add origin https://github.com/votre-compte/ITinventory.git
   # ou mettez à jour l'URL existante
   git remote set-url origin https://github.com/votre-compte/ITinventory.git
   ```
5. **Poussez vos commits**
   ```bash
   git push origin <nom-de-votre-branche>
   ```

💡 Astuce : utilisez `git push -u origin <branche>` la première fois afin d'associer la branche locale à la branche distante, ce qui vous permettra ensuite de simplement exécuter `git push`.

## 📞 Support

Pour toute question ou support :
- Créez un issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement
