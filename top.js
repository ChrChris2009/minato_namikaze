const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "top",
    aliases: ["tp", "rich"],
    version: "2.1",
    author: "chris st",
    role: 0,
    shortDescription: {
      fr: "Affiche le Top 15 des utilisateurs les plus riches en image."
    },
    longDescription: {
      fr: "Génère un superbe classement visuel des membres ayant le plus d'argent."
    },
    category: "top",
    guide: {
      fr: "{pn}"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    // Calcul de la date et de l'heure de la mission
    const optionsDate = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateNow = new Date().toLocaleDateString('fr-FR', optionsDate);
    const timeNow = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Fonction de formatage de l'argent
    function formatMoney(amount) {
      if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} B`;
      if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)} M`;
      if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)} K`;
      return amount.toString();
    }

    try {
      // Récupération et tri des données des utilisateurs (Top 15)
      const allUsers = await usersData.getAll();
      const topUsers = allUsers.sort((a, b) => (b.money || 0) - (a.money || 0)).slice(0, 15);

      if (topUsers.length === 0) {
        return message.reply("🍃 Aucun ninja n'a encore amassé de richesses dans la base de données.");
      }

      // Configuration du Canvas (Largeur: 650px, Hauteur dynamique selon le nombre d'utilisateurs)
      const itemHeight = 50; 
      const headerHeight = 130;
      const footerHeight = 40;
      const canvasWidth = 650;
      const canvasHeight = headerHeight + (topUsers.length * itemHeight) + footerHeight;

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      // 1. FOND DU CANVAS (Style Éclair Jaune / Sombre & Or)
      ctx.fillStyle = '#111217'; // Fond sombre principal
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Dégradé pour l'entête
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
      gradient.addColorStop(0, '#e6a100'); // Or Minato
      gradient.addColorStop(1, '#f39c12');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, headerHeight - 30);

      // 2. TEXTE DE L'ENTÊTE
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('🏆 CLASSEMENT DES RICHES', 40, 55);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'italic 16px Arial';
      ctx.fillText('Les plus grandes fortunes de Konoha', 40, 85);

      // Sous-barre des catégories
      ctx.fillStyle = '#1a1c24';
      ctx.fillRect(0, headerHeight - 30, canvasWidth, 30);
      
      ctx.fillStyle = '#8e9297';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('RANG & NOM', 40, headerHeight - 10);
      ctx.fillText('FORTUNE', canvasWidth - 150, headerHeight - 10);

      // 3. DESSIN DE LA LISTE DES UTILISATEURS
      topUsers.forEach((user, index) => {
        const yPos = headerHeight + (index * itemHeight);

        // Alternance de couleur de fond pour les lignes
        ctx.fillStyle = index % 2 === 0 ? '#161821' : '#111217';
        ctx.fillRect(0, yPos, canvasWidth, itemHeight);

        // Couleur selon le podium (Or, Argent, Bronze)
        let rankColor = '#ffffff';
        if (index === 0) rankColor = '#ffd700'; // 1er
        else if (index === 1) rankColor = '#c0c0c0'; // 2ème
        else if (index === 2) rankColor = '#cd7f32'; // 3ème

        // Affichage du Rang
        ctx.fillStyle = rankColor;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${index + 1}.`, 35, yPos + 32);

        // Affichage du Nom
        ctx.fillStyle = '#ffffff';
        ctx.font = index < 3 ? 'bold 16px Arial' : '16px Arial';
        const userName = user.name || `Ninja anonyme`;
        
        // Sécurité pour couper le nom s'il déborde
        const truncatedName = userName.length > 25 ? userName.substring(0, 25) + '...' : userName;
        ctx.fillText(truncatedName, 75, yPos + 32);

        // Affichage du Montant
        ctx.fillStyle = '#00ff88'; // Vert argent
        ctx.font = 'bold 16px Arial';
        const moneyText = `${formatMoney(user.money || 0)} 💲`;
        ctx.fillText(moneyText, canvasWidth - 150, yPos + 32);
      });

      // 4. BAS DE PAGE (FOOTER)
      const footerY = canvasHeight - footerHeight;
      ctx.fillStyle = '#1a1c24';
      ctx.fillRect(0, footerY, canvasWidth, footerHeight);

      ctx.fillStyle = '#f39c12';
      ctx.font = 'italic 12px Arial';
      ctx.fillText('Continuez à vous entraîner et à gagner vos missions !', 40, footerY + 25);

      // 5. CRÉATION DU FICHIER IMAGE TEMPORAIRE (CACHE)
      const buffer = canvas.toBuffer('image/png');
      const cacheDir = path.join(__dirname, 'cache');
      const cachePath = path.join(cacheDir, 'top_rich.png');

      // Vérification et création sécurisée du dossier cache s'il manque
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      fs.writeFileSync(cachePath, buffer);

      // Construction du bloc de texte Minato
      const finalNotification = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 
 MINATO NAMIKAZE 
━━━━━━━━━━━━━━━━━━━
👤 𝖠𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾𝗋:
• chris st
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ ⚡ *Technique d'analyse financière !* Mon parchemin de détection vient de générer le classement visuel des fortunes de ce monde.
━━━━━━━━━━━━━━━━━━━
⏰ 𝗧𝗶𝗺𝗲 𝗻𝗼𝘄: ${timeNow}
📆 𝗗𝗮𝘁𝗲 𝗻𝗼𝘄: ${dateNow}
━━━━━━━━━━━━━━━━━━━
ℹ️ | Rapport d'analyse financière de l'𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`;

      // Envoi combiné du message texte et du flux de l'image
      return message.reply({
        body: finalNotification,
        attachment: fs.createReadStream(cachePath)
      }, () => {
        // Nettoyage automatique du fichier cache après 5 secondes
        setTimeout(() => { 
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); 
        }, 5000);
      });

    } catch (error) {
      console.error("Erreur lors de la création du classement Canvas :", error);
      return message.reply("⚡ *Erreur de l'Éclair Jaune :* Impossible de dresser le parchemin visuel des richesses. Vérifie les logs de la console.");
    }
  }
};
