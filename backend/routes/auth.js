// Import des modules nécessaires
const express = require("express");
const router = express.Router(); // mini serveur qui gère les routes d'authentification
const bcrypt = require("bcrypt"); // pour chiffrer les mots de passe
const pool = require("../db"); // connexion à PostgreSQL
const jwt = require("jsonwebtoken"); // pour générer les tokens de connexion
const { body, validationResult } = require("express-validator"); // pour valider les données

// ─────────────────────────────────────────
// INSCRIPTION
// ─────────────────────────────────────────
router.post("/inscription",

    // Règles de validation des données
    body("email")
        .isEmail()
        .withMessage("Email invalide !"),
    body("mot_de_passe")
        .isLength({ min: 8 })
        .withMessage("Le mot de passe doit faire au moins 8 caractères !")
        .matches(/[A-Z]/)
        .withMessage("Le mot de passe doit contenir au moins une majuscule !")
        .matches(/[0-9]/)
        .withMessage("Le mot de passe doit contenir au moins un chiffre !"),

    async (req, res) => {
        try {
            // Vérifier si les règles de validation sont respectées
            const erreurs = validationResult(req);
            if (!erreurs.isEmpty()) {
                // Retourner le premier message d'erreur trouvé
                return res.status(400).json({ 
                    message: erreurs.array()[0].msg 
                });
            }

            // Récupérer email et mot de passe depuis le body
            const { email, mot_de_passe } = req.body;

            // Vérifier que l'email n'est pas déjà utilisé
            const userExiste = await pool.query(
                "SELECT * FROM utilisateurs WHERE email = $1",
                [email]
            );

            if (userExiste.rows.length > 0) {
                return res.status(400).json({ message: "Email déjà utilisé !" });
            }

            // Chiffrer le mot de passe avant de le stocker
            // Le 10 est le niveau de sécurité du chiffrement
            const motDePasseChiffre = await bcrypt.hash(mot_de_passe, 10);

            // Sauvegarder le nouvel utilisateur dans la base de données
            await pool.query(
                "INSERT INTO utilisateurs (email, mot_de_passe) VALUES ($1, $2)",
                [email, motDePasseChiffre]
            );

            res.status(201).json({ message: "Inscription réussie !" });

        } catch (erreur) {
            console.log("ERREUR:", erreur.message);
            res.status(500).json({ message: "Erreur serveur", erreur: erreur.message });
        }
    }
);

// ─────────────────────────────────────────
// CONNEXION
// ─────────────────────────────────────────
router.post("/connexion", async (req, res) => {
    try {
        // Récupérer email et mot de passe depuis le body
        const { email, mot_de_passe } = req.body;

        // Vérifier que l'email existe dans la base de données
        const user = await pool.query(
            "SELECT * FROM utilisateurs WHERE email = $1",
            [email]
        );

        // Si aucun utilisateur trouvé → email incorrect
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // Comparer le mot de passe entré avec le mot de passe chiffré en DB
        const motDePasseValide = await bcrypt.compare(
            mot_de_passe,
            user.rows[0].mot_de_passe
        );

        // Si le mot de passe ne correspond pas
        if (!motDePasseValide) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // Générer un token JWT valable 24h
        // Le token contient l'id et l'email de l'utilisateur
        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email },
            process.env.JWT_SECRET, // clé secrète dans le .env
            { expiresIn: "24h" }
        );

        // Renvoyer le token au frontend
        res.json({ message: "Connexion réussie !", token });

    } catch (erreur) {
        console.log("ERREUR:", erreur.message);
        res.status(500).json({ message: "Erreur serveur", erreur: erreur.message });
    }
});

// Export du router pour l'utiliser dans index.js
module.exports = router;