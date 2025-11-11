#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration de IT Inventory...');

// Vérifier si Node.js est installé
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' });
    console.log(`✅ Node.js ${nodeVersion.trim()} détecté`);
} catch (error) {
    console.log('❌ Node.js n\'est pas installé. Veuillez installer Node.js 18+.');
    process.exit(1);
}

// Vérifier si npm est installé
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' });
    console.log(`✅ npm ${npmVersion.trim()} détecté`);
} catch (error) {
    console.log('❌ npm n\'est pas installé.');
    process.exit(1);
}

// Créer le fichier .env s'il n'existe pas
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Fichier .env créé');
} else {
    console.log('✅ Fichier .env existe déjà');
}

// Installer les dépendances
console.log('📦 Installation des dépendances...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dépendances installées');
} catch (error) {
    console.log('❌ Échec de l\'installation des dépendances');
    process.exit(1);
}

// Générer le client Prisma
console.log('🔧 Génération du client Prisma...');
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Client Prisma généré');
} catch (error) {
    console.log('❌ Échec de la génération du client Prisma');
    process.exit(1);
}

// Initialiser la base de données
console.log('🗃️  Initialisation de la base de données...');
try {
    // Vérifier si le serveur est en cours d'exécution
    execSync('curl -s http://localhost:3000/api/health > /dev/null 2>&1 || (echo "Serveur non démarré, tentative de démarrage..." && npm run dev & sleep 5 && curl -s http://localhost:3000/api/health > /dev/null 2>&1)', { 
        stdio: 'inherit',
        timeout: 10000 
    });
    
    // Envoyer la requête de seed
    execSync('curl -X POST http://localhost:3000/api/seed', { stdio: 'inherit' });
    console.log('✅ Base de données initialisée');
} catch (error) {
    console.log('⚠️  La base de données semble déjà contenir des données ou le serveur n\'est pas accessible');
}

console.log('');
console.log('🎉 Configuration terminée !');
console.log('');
console.log('Pour lancer l\'application :');
console.log('  npm run dev');
console.log('');
console.log('L\'application sera disponible à :');
console.log('  http://localhost:3000');
console.log('');