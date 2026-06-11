// Import de jsonwebtoken pour vérifier le token
const jwt = require("jsonwebtoken");

// Charge les variables du .env
require("dotenv").config();

// ─────────────────────────────────────────
// MIDDLEWARE DE VÉRIFICATION DU TOKEN JWT
// ─────────────────────────────────────────
// Ce middleware s'exécute AVANT les routes protégées
// Il vérifie que l'utilisateur est bien connecté
const verifierToken = (req, res, next) => {
    try {
        // Récupère le token dans le header de la requête
        // Le header ressemble à : "Authorization: Bearer eyJhbGci..."
        // On coupe au espace pour garder uniquement le token après "Bearer"
        const token = req.headers.authorization?.split(" ")[1];

        // Si pas de token → l'utilisateur n'est pas connecté
        if (!token) {
            return res.status(401).json({ message: "Token manquant !" });
        }

        // Vérifie que le token est valide et qu'il a été signé avec notre secret
        // Si le token est expiré ou falsifié → jwt.verify lance une erreur
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ajoute les infos de l'utilisateur à la requête
        // req.user sera disponible dans toutes les routes protégées
        // Exemple : req.user = { id: 1, email: "ludovic@gmail.com" }
        req.user = decoded;

        // Laisse passer vers la route suivante
        next();

    } catch (erreur) {
        // Token invalide ou expiré
        res.status(401).json({ message: "Token invalide !" });
    }
};

// Export du middleware pour l'utiliser dans les routes
module.exports = verifierToken;