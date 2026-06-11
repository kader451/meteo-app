// Import des modules nécessaires
const express = require("express");
const router = express.Router(); // mini serveur qui gère les routes météo
const fetch = require("node-fetch"); // pour faire des requêtes HTTP vers l'API météo
const verifierToken = require("../middleware/auth"); // middleware de vérification JWT

// ─────────────────────────────────────────
// RÉCUPÉRER LA MÉTÉO D'UNE VILLE
// ─────────────────────────────────────────
// verifierToken vérifie que l'utilisateur est connecté avant d'accéder à la météo
router.get("/", verifierToken, async (req, res) => {
    try {
        // Récupère le nom de la ville depuis l'URL
        // Exemple : GET /meteo?ville=Paris → req.query.ville = "Paris"
        const { ville } = req.query;

        // Vérifier qu'une ville a bien été fournie
        if (!ville) {
            return res.status(400).json({ message: "Ville manquante !" });
        }

        // Appel à l'API OpenWeatherMap
        // La clé API est cachée dans le .env — invisible depuis le frontend !
        // units=metric → température en celsius
        // lang=fr → description en français
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ville}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=fr`);

        // Convertir la réponse en objet JS
        const data = await response.json();

        // Vérifier si la ville existe dans l'API
        if (data.cod === "404") {
            return res.status(404).json({ message: "Ville introuvable !" });
        }

        // Renvoyer uniquement les données utiles au frontend
        // On ne renvoie pas tout l'objet data pour ne pas exposer des infos inutiles
        res.json({
            ville: data.name,                        // nom de la ville
            temperature: data.main.temp,             // température en celsius
            description: data.weather[0].description, // description météo en français
            humidite: data.main.humidity,            // humidité en %
            vent: data.wind.speed                    // vitesse du vent en m/s
        });

    } catch (erreur) {
        res.status(500).json({ message: "Erreur serveur", erreur: erreur.message });
    }
});

// Export du router pour l'utiliser dans index.js
module.exports = router;