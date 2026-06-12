const express = require("express");
const cors = require("cors");
require("dotenv").config(); // charge les variables du .env
require("./db"); // connexion à PostgreSQL

// Import des routes
const authRoutes = require("./routes/auth");
const meteoRoutes = require("./routes/meteo");
const favorisRoutes = require("./routes/favoris");

// Import du rate limiter
const rateLimit = require("express-rate-limit");

const app = express();

// Middlewares — s'exécutent sur chaque requête
app.use(cors({
    origin: "https://meteo-ludo.vercel.app"
}));// autorise le frontend à parler au backend
app.use(express.json()); // permet de lire le JSON des requêtes

// Rate limiting général — toutes les routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
    max: 100, // 100 requêtes max par fenêtre
    message: { message: "Trop de requêtes, réessayez dans 15 minutes !" }
});

// Rate limiting strict — routes d'authentification uniquement
const limiterAuth = rateLimit({
    windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
    max: 5, // 5 tentatives max — protège contre les attaques par force brute
    message: { message: "Trop de tentatives, réessayez dans 15 minutes !" }
});

// Application des limiters
app.use(limiter); // appliqué à toutes les routes
app.use("/auth/connexion", limiterAuth); // appliqué uniquement à la connexion
app.use("/auth/inscription", limiterAuth); // appliqué uniquement à l'inscription

// Branchement des routes
app.use("/auth", authRoutes); // routes d'authentification
app.use("/meteo", meteoRoutes); // routes météo
app.use("/favoris", favorisRoutes); // routes favoris

// Route de test — vérifie que le serveur tourne
app.get("/", (req, res) => {
    res.json({ message: "Serveur opérationnel !" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});