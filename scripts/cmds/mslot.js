const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const FORMAT_URL = "https://numbers-conversion.vercel.app/api/format";
const CASH_URL = "https://cash-api-five.vercel.app/api/cash";

const MAX_LIMIT = 10n ** 261n;
const MAX_SPINS = 15;
const RESET_MS = 30 * 60 * 1000;

let gameActive = true; // État du jeu
let tournaments = []; // Liste des tournois
let userStats = {}; // Statistiques des utilisateurs

// Fonction pour activer ou désactiver le jeu
function toggleGame() {
    gameActive = !gameActive;
    return gameActive ? "Le jeu est activé!" : "Le jeu est désactivé!";
}

// Fonction pour générer un tableau des leaders
async function getLeaderboard() {
    // Logique pour récupérer et afficher le classement
    return "Classement des joueurs : ..."; // Remplacer par votre logique
}

// Fonction pour gérer les tournois
async function startTournament(userId) {
    // Logique pour organiser un tournoi
    if (!tournaments.includes(userId)) {
        tournaments.push(userId);
        return "Vous avez rejoint le tournoi!";
    }
    return "Vous êtes déjà dans le tournoi!";
}

// Fonction pour donner une récompense quotidienne
async function dailyReward(userId) {
    const reward = 100; // Montant de la récompense
    userStats[userId] = (userStats[userId] || 0) + reward; // Ajouter la récompense au solde de l'utilisateur
    return `Vous avez reçu ${reward}$ comme récompense quotidienne!`;
}

// Fonction pour afficher le profil utilisateur
async function userProfile(userId) {
    const balance = userStats[userId] || 0;
    return `Votre solde actuel est de ${balance}$`;
}

// Fonction pour afficher l'aide
function showHelp() {
    return `
    📜 **Menu d'Aide de Minato Slot** 📜
    - \`!slot <montant>\` : Jouez à la machine à sous avec un montant.
    - \`!slot stats\` : Affichez vos statistiques.
    - \`!slot daily\` : Réclamez votre récompense quotidienne.
    - \`!slot tournament\` : Participez à un tournoi.
    - \`!slot leaderboard\` : Affichez le classement.
    - \`!slot profile\` : Affichez votre profil.
    - \`!slot toggle\` : Activez ou désactivez le jeu.
    `;
}

// Fonction pour créer un canvas
async function createSlotCard({ username, bet, win, winAmount, newBalance, slots, multiplier, rank }) {
    const W = 800, H = 500;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Fond dégradé
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1a0f2e");
    bg.addColorStop(1, "#070410");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Titre
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 30px 'Courier New'";
    ctx.fillText("🎰 Minato Slot Machine 🎰", 30, 40);

    // Affichage des résultats
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px 'Courier New'";
    ctx.fillText(`Résultat: [ ${slots.join(' | ')} ]`, 30, 100);
    ctx.fillText(`Mise: ${bet}$`, 30, 140);
    ctx.fillText(`Gains: ${win ? `+${winAmount}$` : `-${Math.abs(winAmount)}$`}`, 30, 180);
    ctx.fillText(`Solde: ${newBalance}$`, 30, 220);
    ctx.fillText(`Classement: ${rank}`, 30, 260);

    return canvas.toBuffer("image/png");
}

// Fonction principale de la machine à sous
module.exports = {
    config: {
        name: "mslot",
        version: "1.0",
        author: "Minato",
        shortDescription: { en: "Minato Slot Ultimate" },
        longDescription: { en: "Ultimate slot machine with tournaments, jackpots, daily rewards, and more!" },
    },
    onStart: async function ({ args, message, event }) {
        const userId = String(event.senderID);
        const command = args[0]?.toLowerCase();

        if (command === "toggle") {
            return message.reply(toggleGame());
        }

        if (command === "help") {
            return message.reply(showHelp());
        }

        if (command === "daily") {
            const rewardMessage = await dailyReward(userId);
            return message.reply(rewardMessage);
        }

        if (command === "tournament") {
            const tournamentMessage = await startTournament(userId);
            return message.reply(tournamentMessage);
        }

        if (command === "profile") {
            const profileMessage = await userProfile(userId);
            return message.reply(profileMessage);
        }

        // Logique de jeu de machine à sous
        if (gameActive) {
            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount <= 0) {
                return message.reply("Veuillez entrer un montant valide.");
            }

            const slots = ["🍒", "🍋", "🍊", "🍉", "🍇", "🍓"];
            const slotResults = [
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)]
            ];

            const winAmount = (slotResults[0] === slotResults[1] && slotResults[1] === slotResults[2]) ? amount * 2 : -amount;
            userStats[userId] = (userStats[userId] || 0) + winAmount;

            const newBalance = userStats[userId];
            const rank = "Nouveau joueur"; // Logique pour déterminer le rang

            const imgBuffer = await createSlotCard({
                username: "Joueur", // Remplacer par le nom d'utilisateur réel
                bet: amount,
                win: winAmount > 0,
                winAmount,
                newBalance,
                slots: slotResults,
                multiplier: 2, // Exemple de multiplicateur
                rank
            });

            // Envoyer l'image en réponse
            const imgPath = `./slot_card_${userId}.png`;
            fs.writeFileSync(imgPath, imgBuffer);
            await message.reply({ body: "Voici votre carte de résultat :", attachment: fs.createReadStream(imgPath) });
            fs.unlinkSync(imgPath); // Supprimer l'image après l'envoi
        } else {
            return message.reply("Le jeu est actuellement désactivé.");
        }
    },
};
