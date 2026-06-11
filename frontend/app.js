// ─────────────────────────────────────────
// TOKEN
// ─────────────────────────────────────────
// Token stocké en mémoire — réinitialisé à chaque rechargement de page
let token = null;

// ─────────────────────────────────────────
// SÉLECTION DES ÉLÉMENTS DU DOM
// ─────────────────────────────────────────

// Éléments du formulaire de connexion
const elementEmail = document.querySelector("#email");
const elementMotDePasse = document.querySelector("#motDePasse");
const elementBoutonConnexion = document.querySelector("#boutonConnexion");
const elementErreurConnexion = document.querySelector("#erreurConnexion");

// Éléments de l'app météo
const elementAppMeteo = document.querySelector("#appMeteo");
const elementFormConnexion = document.querySelector("#formConnexion");
const elementInput = document.querySelector("#ville");
const elementBouton = document.querySelector("#bouton");
const elementResultat = document.querySelector("#resultat");
const elementNomVille = document.querySelector("#nomVille");
const elementTemperature = document.querySelector("#temperature");
const elementDescription = document.querySelector("#description");
const elementBoutonDeconnexion = document.querySelector("#boutonDeDeconnexion");
const elementBoutonFavori = document.querySelector("#boutonFavori");
const elementListeFavoris = document.querySelector("#listeFavoris");

// Éléments du formulaire d'inscription
const elementFormInscription = document.querySelector("#formInscription");
const elementEmailInscription = document.querySelector("#emailInscription");
const elementMotDePasseInscription = document.querySelector("#motDePasseInscription");
const elementBoutonInscription = document.querySelector("#boutonInscription");
const elementErreurInscription = document.querySelector("#erreurInscription");
const elementVersInscription = document.querySelector("#versInscription");
const elementVersConnexion = document.querySelector("#versConnexion");

// ─────────────────────────────────────────
// CONNEXION
// ─────────────────────────────────────────
elementBoutonConnexion.addEventListener("click", async () => {
    try {
        // Envoie email + mot de passe au backend
        const response = await fetch("http://localhost:3000/auth/connexion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: elementEmail.value,
                mot_de_passe: elementMotDePasse.value
            })
        });

        const data = await response.json();

        // Si erreur → affiche le message d'erreur
        if (!response.ok) {
            elementErreurConnexion.textContent = data.message;
            return;
        }

        // Stocke le token en mémoire
        token = data.token;

        // Cache le formulaire de connexion et affiche l'app météo
        elementFormConnexion.style.display = "none";
        elementAppMeteo.style.display = "block";

        // Charge les favoris dès la connexion
        chargerFavoris();

    } catch (erreur) {
        elementErreurConnexion.textContent = "Erreur de connexion au serveur";
    }
});

// ─────────────────────────────────────────
// DÉCONNEXION
// ─────────────────────────────────────────
elementBoutonDeconnexion.addEventListener("click", () => {
    // Supprime le token de la mémoire
    token = null;

    // Affiche le formulaire de connexion et cache l'app météo
    elementFormConnexion.style.display = "block";
    elementAppMeteo.style.display = "none";
});

// ─────────────────────────────────────────
// MÉTÉO
// ─────────────────────────────────────────
async function recupererMeteo(ville) {
    try {
        // Appel au backend avec le token dans le header
        // Le backend appellera OpenWeatherMap avec la clé API cachée
        const response = await fetch(`http://localhost:3000/meteo?ville=${ville}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        // Si erreur → affiche le message d'erreur
        if (!response.ok) {
            elementDescription.textContent = data.message;
            elementNomVille.textContent = "";
            elementTemperature.textContent = "";
            return;
        }

        // Affiche les données météo dans le DOM
        elementNomVille.textContent = data.ville;
        elementTemperature.textContent = `${data.temperature}°C`;
        elementDescription.textContent = data.description;
        elementResultat.style.display = "block";

        // Affiche le bouton "Ajouter aux favoris"
        afficherBoutonFavori();

    } catch (erreur) {
        console.log(`Erreur : ${erreur}`);
    }
}

// Lance la recherche météo au clic sur le bouton
elementBouton.addEventListener("click", () => {
    recupererMeteo(elementInput.value);
});

// Lance la recherche météo en appuyant sur Entrée
elementInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        recupererMeteo(elementInput.value);
    }
});

// ─────────────────────────────────────────
// INSCRIPTION
// ─────────────────────────────────────────

// Bascule vers le formulaire d'inscription
elementVersInscription.addEventListener("click", () => {
    elementFormConnexion.style.display = "none";
    elementFormInscription.style.display = "flex";
});

// Bascule vers le formulaire de connexion
elementVersConnexion.addEventListener("click", () => {
    elementFormInscription.style.display = "none";
    elementFormConnexion.style.display = "block";
});

// Envoie les données d'inscription au backend
elementBoutonInscription.addEventListener("click", async () => {
    try {
        const response = await fetch("http://localhost:3000/auth/inscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: elementEmailInscription.value,
                mot_de_passe: elementMotDePasseInscription.value
            })
        });

        const data = await response.json();

        // Si erreur → affiche le message d'erreur
        if (!response.ok) {
            elementErreurInscription.textContent = data.message;
            return;
        }

        // Inscription réussie → bascule vers le formulaire de connexion
        elementFormInscription.style.display = "none";
        elementFormConnexion.style.display = "flex";
        elementErreurConnexion.textContent = "Inscription réussie ! Connectez-vous 😊";
        elementErreurConnexion.style.color = "lightgreen";

    } catch (erreur) {
        elementErreurInscription.textContent = "Erreur de connexion au serveur";
    }
});

// ─────────────────────────────────────────
// FAVORIS
// ─────────────────────────────────────────

// Affiche le bouton "Ajouter aux favoris" après une recherche météo
function afficherBoutonFavori() {
    elementBoutonFavori.style.display = "block";
}

// Charge et affiche la liste des favoris depuis le backend
async function chargerFavoris() {
    try {
        // Récupère les favoris de l'utilisateur connecté
        const response = await fetch("http://localhost:3000/favoris", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        // Vide la liste avant de la remplir pour éviter les doublons
        elementListeFavoris.innerHTML = "";

        // Crée un élément <li> pour chaque favori
        data.forEach((favori) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="nomVilleFavori">${favori.ville}</span>
                <button onclick="supprimerFavori(${favori.id})">🗑️</button>
            `;

            // Clic sur le nom de la ville → affiche sa météo
            li.querySelector(".nomVilleFavori").addEventListener("click", () => {
                elementInput.value = favori.ville;
                recupererMeteo(favori.ville);
            });
            
            // Ajoute le <li> dans la liste
            elementListeFavoris.appendChild(li);
        });

    } catch (erreur) {
        console.log("Erreur favoris :", erreur);
    }
}

// Ajoute la ville affichée dans les favoris
elementBoutonFavori.addEventListener("click", async () => {
    try {
        // Récupère le nom de la ville depuis le DOM
        const ville = elementNomVille.textContent;

        // Envoie la ville au backend avec le token
        await fetch("http://localhost:3000/favoris", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ville })
        });

        // Recharge la liste des favoris
        chargerFavoris();

    } catch (erreur) {
        console.log("Erreur ajout favori :", erreur);
    }
});

// Supprime un favori par son id
async function supprimerFavori(id) {
    try {
        // Envoie une requête DELETE au backend avec l'id du favori
        await fetch(`http://localhost:3000/favoris/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        // Recharge la liste des favoris après suppression
        chargerFavoris();

    } catch (erreur) {
        console.log("Erreur suppression :", erreur);
    }
}