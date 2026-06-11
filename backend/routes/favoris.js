// Import des modules nécessaires
const express = require("express");
const router = express.Router(); // mini serveur qui gère les routes des favoris
const pool = require("../db"); // connexion à PostgreSQL
const verifierToken = require("../middleware/auth"); // middleware de vérification JWT

// ─────────────────────────────────────────
// RÉCUPÉRER SES FAVORIS
// ─────────────────────────────────────────
// verifierToken vérifie que l'utilisateur est connecté avant d'accéder à ses favoris
router.get("/", verifierToken, async (req, res) => {
    try {
        // Récupère uniquement les favoris de l'utilisateur connecté
        // req.user.id vient du token JWT décodé dans le middleware
        const favoris = await pool.query(
            "SELECT * FROM villes_favorites WHERE utilisateur_id = $1",
            [req.user.id]
        );

        // Retourne la liste des favoris en JSON
        res.json(favoris.rows);

    } catch (erreur) {
        res.status(500).json({ message: "Erreur serveur", erreur: erreur.message });
    }
});

// ─────────────────────────────────────────
// AJOUTER UN FAVORI
// ─────────────────────────────────────────
router.post("/", verifierToken, async (req, res) => {
    try {
        // Récupère le nom de la ville depuis le body
        const { ville } = req.body;

        // Insère la ville dans la DB liée à l'utilisateur connecté
        // req.user.id garantit que la ville est ajoutée au bon utilisateur
        await pool.query(
            "INSERT INTO villes_favorites (utilisateur_id, ville) VALUES ($1, $2)",
            [req.user.id, ville]
        );

        res.status(201).json({ message: "Ville ajoutée aux favoris !" });

    } catch (erreur) {
        res.status(500).json({ message: "Erreur serveur", erreur: erreur.message });
    }
});

// ─────────────────────────────────────────
// SUPPRIMER UN FAVORI
// ─────────────────────────────────────────
router.delete("/:id", verifierToken, async (req, res) => {
    try {
        // Supprime le favori en vérifiant DEUX conditions :
        // 1. L'id du favori correspond → req.params.id (vient de l'URL /favoris/3)
        // 2. Le favori appartient bien à l'utilisateur connecté → req.user.id
        // Cela empêche un utilisateur de supprimer les favoris d'un autre !
        await pool.query(
            "DELETE FROM villes_favorites WHERE id = $1 AND utilisateur_id = $2",
            [req.params.id, req.user.id]
        );

        res.json({ message: "Ville supprimée des favoris !" });

    } catch (erreur) {
        res.status(500).json({ message: "Erreur serveur", erreur: erreur.message });
    }
});

// Export du router pour l'utiliser dans index.js
module.exports = router;