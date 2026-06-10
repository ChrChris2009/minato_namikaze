module.exports = {
  config: {
    name: "minatoname",
    aliases: ["botname", "minatoname"],
    version: "1.0",
    author: "chris st",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Change le nom de code de Minato dans tous les groupes.",
      fr: "Change le nom de code de Minato dans tous les groupes."
    },
    longDescription: {
      en: "Permet au Hokage de modifier le surnom du bot sur l'ensemble des discussions de groupe en un instant.",
      fr: "Permet au Hokage de modifier le surnom du bot sur l'ensemble des discussions de groupe en un instant."
    },
    category: "𝗢𝗪𝗡𝗘𝗥",
    guide: {
      en: "{pn} <nouveau nom>",
      fr: "{pn} <nouveau nom>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  onStart: async function({ api, args, threadsData, usersData, message }) {
    // 1. Récupération des données du propriétaire (Créateur / Admin principal)
    const ownerID = global.GoatBot.config.GOD[0] || api.getCurrentUserID();
    let ownerName = "L'Éclair Jaune de Konoha";
    try {
      const ownerInfo = await usersData.getName(ownerID);
      if (ownerInfo) ownerName = ownerInfo;
    } catch (e) {
      console.error("Impossible de récupérer le nom du propriétaire :", e);
    }

    // Préparation des statistiques de temps pour la notification
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
    const optionsDate = { weekday: 'long', month: 'long', day: 'numeric' };
    const now = new Date();
    
    const timeNow = now.toLocaleTimeString('en-US', optionsTime); // Format 06:24 AM
    const dateNow = now.toLocaleDateString('fr-FR', optionsDate); // Format Lundi, 1 juin

    // Calcul des membres de l'alliance (tous les groupes combinés)
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

    // Si les genres ne sont pas disponibles, on applique une répartition par défaut
    if (totalMale === 0 && totalFemale === 0 && totalMembers > 0) {
      totalMale = Math.floor(totalMembers * 0.75);
      totalFemale = totalMembers - totalMale;
    }

    // Variables par défaut si vides pour le style
    const displayTotalMembers = totalMembers || 100;
    const displayTotalMale = totalMale || 75;
    const displayTotalFemale = totalFemale || 25;
    const displayDate = dateNow.charAt(0).toUpperCase() + dateNow.slice(1);

    const newNickname = args.join(" ");

    // 2. Vérification du nom (Réponse d'erreur stylisée)
    if (!newNickname) {
      const errorStyle = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 ⚡𝗠𝗜𝗡𝗔𝗧𝗢-𝗕𝗢𝗧⚡
━━━━━━━━━━━━━━━━━━━
👤 𝖤𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾𝗋:
• ${ownerName}
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ ⚡ [Minato] : Un ninja doit avoir un nom. Dis-moi quel nouveau pseudonyme m'attribuer !

👥 𝗧𝗢𝗧𝗔𝗟 𝗠𝗘𝗠𝗕𝗘𝗥𝗦: ${displayTotalMembers}
🚹 𝗠𝗔𝗟𝗘: ${displayTotalMale} | 🚺 𝗙𝗘𝗠𝗔𝗟Ｅ: ${displayTotalFemale}
⏰ 𝗧𝗶𝗺𝗲 𝗻𝗼𝘄: ${timeNow}
📆 𝗗𝗮𝘁𝗲 𝗻𝗼𝘄: ${displayDate}
━━━━━━━━━━━━━━━━━━━
ℹ️ | C'est une annonce officielle du 𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`;
      
      return message.reply(errorStyle);
    }

    // 3. Récupération de tous les groupes pour l'action
    const threadIds = allThreadID.map(thread => thread.threadID);

    // 4. Lancement du changement de nom
    const nicknameChangePromises = threadIds.map(async threadId => {
      try {
        await api.changeNickname(newNickname, threadId, api.getCurrentUserID());
        return true;
      } catch (error) {
        return null;
      }
    });

    const results = await Promise.allSettled(nicknameChangePromises);
    const successCount = results.filter(r => r.status === "fulfilled" && r.value !== null).length;

    // 5. Construction et envoi du message de réussite stylisé
    const notificationMessage = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 ⚡𝗠𝗜𝗡𝗔𝗧𝗢-𝗕𝗢𝗧⚡
━━━━━━━━━━━━━━━━━━━
👤 𝖠𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾𝗋:
• ${ownerName}
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ Hiraishin déployé ! Mon nom a été modifié en "${newNickname}" dans ${successCount} zones de combat (groupes).

👥 𝗧𝗢𝗧𝗔𝗟 𝗠𝗘𝗠𝗕𝗘𝗥𝗦: ${displayTotalMembers}
🚹 𝗠𝗔𝗟𝗘: ${displayTotalMale} | 🚺 𝗙𝗘𝗠𝗔𝗟Ｅ: ${displayTotalFemale}
⏰ 𝗧𝗶𝗺𝗲 𝗻𝗼𝘄: ${timeNow}
📆 𝗗𝗮𝘁𝗲 𝗻𝗼𝘄: ${displayDate}
━━━━━━━━━━━━━━━━━━━
ℹ️ | C'est une annonce officielle du 𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`;

    message.reply(notificationMessage);
  }
};
