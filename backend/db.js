// Import du module pg pour se connecter à PostgreSQL
const { Pool } = require("pg");

// Charge les variables du .env
require("dotenv").config();

// Création du pool de connexions à PostgreSQL
// Un pool garde plusieurs connexions ouvertes et les réutilise
// C'est plus performant que d'ouvrir/fermer une connexion à chaque requête
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // toutes les infos en une seule ligne
    ssl: { rejectUnauthorized: false }          // obligatoire pour Neon
});

// Test de la connexion au démarrage du serveur
pool.connect()
    .then(() => console.log("Connecté à PostgreSQL ✅"))
    .catch((err) => console.log("Erreur de connexion ❌", err));

// Export du pool pour l'utiliser dans les routes
module.exports = pool;