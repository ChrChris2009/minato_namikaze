const fs = require('fs-extra');
const pathFile = __dirname + '/cache/autoseen.txt';

module.exports = {
  config: {
    name: "autoseen",
    version: "1.0.0",
    hasPermssion: 2,
    author: "chris st",
    shortDescription: {
      en: "Turn on/off automatically seen when new messages are available",
      fr: "Active ou désactive le vu automatique pour les nouveaux messages."
    },
    longDescription: {
      en: "Turn on/off automatically seen when new messages are available",
      fr: "Active ou désactive le vu automatique pour les nouveaux messages."
    },
    category: "𝗕𝗢𝗫 𝗖𝗛𝗔𝗧",
    guide: {
      en: "on/off",
      fr: "on/off"
    },
    cooldowns: 5,
  },

  onChat: async ({ api, event }) => {
    if (!fs.existsSync(pathFile)) fs.writeFileSync(pathFile, 'false');
    const isEnable = fs.readFileSync(pathFile, 'utf-8');
    if (isEnable == 'true') api.markAsReadAll(() => {});
  },

  onStart: async ({ api, event, args, usersData, threadsData }) => {
    // 1. Récupération des données du propriétaire
    const ownerID = global.GoatBot.config.GOD[0] || api.getCurrentUserID();
    let ownerName = "L'Éclair Jaune de Konoha";
    try {
      const ownerInfo = await usersData.getName(ownerID);
      if (ownerInfo) ownerName = ownerInfo;
    } catch (e) {
      console.error("Impossible de récupérer le nom du propriétaire :", e);
    }

    // Préparation des statistiques et du temps pour la notification
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
    const optionsDate = { weekday: 'long', month: 'long', day: 'numeric' };
    const now = new Date();
    
    const timeNow = now.toLocaleTimeString('en-US', optionsTime);
    const dateNow = now.toLocaleDateString('fr-FR', optionsDate);

    const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
    let totalMembers = 0;
    let totalMale = 0;
    let totalFemale = 0;

    allThreadID.forEach(t => {
      if (t.members) {
        totalMembers += t.members.length;
        totalMale += t.members.filter(m => m.gender === "MALE").length;
        totalFemale += t.members.filter(m => m.gender === "FEMALE").length;
      }
    });

    if (totalMale === 0 && totalFemale === 0 && totalMembers > 0) {
      totalMale = Math.floor(totalMembers * 0.75);
      totalFemale = totalMembers - totalMale;
    }

    const displayTotalMembers = totalMembers || 100;
    const displayTotalMale = totalMale || 75;
    const displayTotalFemale = totalFemale || 25;
    const displayDate = dateNow.charAt(0).toUpperCase() + dateNow.slice(1);

    // Fonction pour générer le message stylisé Minato
    const generateMessage = (messageContent) => {
      return `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 ⚡𝗠𝗜𝗡𝗔𝗧𝗢-𝗕𝗢𝗧⚡
━━━━━━━━━━━━━━━━━━━
👤 𝖠𝖽𝗆𝗂̣n/𝖮𝗐𝗇𝖾𝗋:
• ${ownerName}
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ ${messageContent}

👥 𝗧𝗢𝗧𝗔𝗟 𝗠𝗘𝗠𝗕Ｅ𝗥𝗦: ${displayTotalMembers}
🚹 𝗠𝗔𝗟Ｅ: ${displayTotalMale} | 🚺 𝗙𝗘𝗠𝗔𝗟Ｅ: ${displayTotalFemale}
⏰ 𝗧𝗶𝗺𝗲 𝗻𝗼𝘄: ${timeNow}
📆 𝗗𝗮𝘁𝗲 𝗻𝗼𝘄: ${displayDate}
━━━━━━━━━━━━━━━━━━━
ℹ️ | C'est une annonce officielle du 𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`;
    };

    try {
      if (args[0] == 'on') {
        fs.writeFileSync(pathFile, 'true');
        const replyMsg = generateMessage('Technique d\'observation activée ! Grâce au Hiraishin, je lirai désormais tous les messages à la vitesse de l\'éclair dès leur arrivée.');
        api.sendMessage(replyMsg, event.threadID, event.messageID);
      } else if (args[0] == 'off') {
        fs.writeFileSync(pathFile, 'false');
        const replyMsg = generateMessage('J\'ai désactivé la surveillance automatique. Je reste en retrait pour le moment, jette un œil aux parchemins de messages quand tu le souhaites.');
        api.sendMessage(replyMsg, event.threadID, event.messageID);
      } else {
        const replyMsg = generateMessage('Désolé, ta formule de ninja n\'est pas correcte... Utilise plutôt "autoseen on" pour activer mon radar, ou "autoseen off" pour le couper.');
        api.sendMessage(replyMsg, event.threadID, event.messageID);
      }
    } catch (e) {
      console.log(e);
    }
  }
};
