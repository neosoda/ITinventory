const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const fabricants = [
  { nom: 'Cisco' },
  { nom: 'Allied Telesis' },
  { nom: 'HP' },
  { nom: 'HP Aruba' },
  { nom: 'Eaton' },
  { nom: 'Dell' },
  { nom: 'Vmware' },
  { nom: 'Microsoft' },
  { nom: 'Linux' }
];

async function addFabricants() {
  try {
    console.log('Ajout des fabricants...');
    
    for (const fabricant of fabricants) {
      try {
        const response = await axios.post(`${API_BASE_URL}/fabricants`, fabricant);
        console.log(`✅ Fabricant ajouté: ${fabricant.nom} (ID: ${response.data.id})`);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log(`⚠️  Fabricant existe déjà: ${fabricant.nom}`);
        } else {
          console.error(`❌ Erreur lors de l'ajout de ${fabricant.nom}:`, error.message);
        }
      }
      
      // Petite pause pour ne pas surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Tous les fabricants ont été traités !');
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécution
addFabricants();