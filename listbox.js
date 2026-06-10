module.exports = {
  config: {
    name: "listbox",
    aliases: ["boxlist", "groups"],
    author: "chris st / Adaptation Minato",
    version: "2.7",
    cooldowns: 5,
    role: 2, // Réservé aux administrateurs du bot
    shortDescription: {
      fr: "Liste tous les groupes avec le nombre de membres et d'admins."
    },
    longDescription: {
      fr: "Permet de lister l'ensemble des groupes dont le bot est membre, avec des statistiques détaillées."
    },
    category: "owner",
    guide: {
      fr: "{p}{n}"
    }
  },

  onStart: async function ({ api, event }) {
    // Calcul de la date et de l'heure actuelles de la mission
    const optionsDate = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateNow = new Date().toLocaleDateString('fr-FR', optionsDate);
    const timeNow = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    try {
      // Récupération des 100 dernières discussions dans la boîte de réception
      const groupList = await api.getThreadList(100, null, ['INBOX']);

      // Filtrer pour ne garder que les groupes
      const filteredList = groupList.filter(group => group.isGroup === true || (group.threadName !== null && group.participantIDs.length > 2));

      if (filteredList.length === 0) {
        const noGroupReply = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 
 MINATO NAMIKAZE 
━━━━━━━━━━━━━━━━━━━
👤 𝖠𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾𝗋:
• Kyle
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ 🍃 L'Éclair Jaune a inspecté les environs... Le bot ne se trouve actuellement dans aucun groupe de discussion.
━━━━━━━━━━━━━━━━━━━
ℹ️ | Rapport de surveillance de l'𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`;
        return await api.sendMessage(noGroupReply, event.threadID, event.messageID);
      }

      // Message d'attente pendant le chargement des détails
      const waitMessage = await api.sendMessage("⚡ *Technique de détection :* Analyse des canaux de communication en cours...", event.threadID);

      let formattedGroups = "";

      // Parcours de chaque groupe pour extraire les informations détaillées
      for (let i = 0; i < filteredList.length; i++) {
        const groupRaw = filteredList[i];
        let threadInfo;

        try {
          // On force la récupération des infos complètes (notamment le nom du thread s'il manquait)
          threadInfo = await api.getThreadInfo(groupRaw.threadID);
        } catch (e) {
          // En cas d'échec de getThreadInfo, on bascule sur les données basiques de la liste
          threadInfo = groupRaw;
        }

        // Détermination du nom du groupe
        let name = threadInfo.threadName;
        if (!name || name.trim() === "") {
          name = threadInfo.name || `Groupe sans nom d'ID: ${threadInfo.threadID}`;
        }

        const totalMembers = threadInfo.participantIDs ? threadInfo.participantIDs.length : 0;
        
        // Extraction et comptage des administrateurs du groupe
        let adminCount = 0;
        if (threadInfo.adminIDs && Array.isArray(threadInfo.adminIDs)) {
          adminCount = threadInfo.adminIDs.length;
        } else if (threadInfo.adminIDs) {
          adminCount = Object.keys(threadInfo.adminIDs).length;
        }

        // Alignement et mise en page propre des réponses
        formattedGroups += `📁 ${i + 1}. ${name}\n`;
        formattedGroups += `🆔 𝗧𝗜𝗗 : ${threadInfo.threadID}\n`;
        formattedGroups += `👥 𝗠𝗲𝗺𝗯𝗿𝗲𝘀 : ${totalMembers}\n`;
        formattedGroups += `👑 𝗔𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗲𝘂𝗿𝘀 : ${adminCount}\n`;
        
        // Ligne de séparation entre les groupes (sauf pour le dernier)
        if (i < filteredList.length - 1) {
          formattedGroups += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
        }
      }

      // Construction finale du message de notification
      const finalReply = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 
 MINATO NAMIKAZE 
━━━━━━━━━━━━━━━━━━━
👤 𝖠𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾𝗋:
• Kyle
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ Rapport d'analyse terminé. Voici les informations des bases (groupes) sous ma surveillance :

${formattedGroups}

🌐 𝗧𝗼𝘁𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝗲𝘀 : ${filteredList.length}
⏰ 𝗧𝗶𝗺𝗲 𝗻𝗼𝘄: ${timeNow}
📆 𝗗𝗮𝘁𝗲 𝗻𝗼𝘄: ${dateNow}
━━━━━━━━━━━━━━━━━━━
ℹ️ | Registre officiel généré par l'𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`;

      // Suppression du message d'attente et envoi du rapport final
      if (waitMessage && waitMessage.messageID) {
        await api.unsendMessage(waitMessage.messageID);
      }
      await api.sendMessage(finalReply, event.threadID, event.messageID);

    } catch (error) {
      console.error("Erreur lors du listage des groupes :", error);
      const errorReply = `⚡ *Erreur de téléportation :* Impossible d'extraire les données des groupes. Vérifie les logs du serveur.`;
      await api.sendMessage(errorReply, event.threadID, event.messageID);
    }
  }
};
