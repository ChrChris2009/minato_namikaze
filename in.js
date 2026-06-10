module.exports = {
  config: {
    name: "in",
    version: "1.0.0",
    permission: 0,
    credits: "chrisst",
    prefix: 'awto',
    description: "Boite de reception / Infos Profil",
    category: "INFO",
    cooldowns: 5
  },

  onStart: async function({ api, event, usersData }) {
    let uid;

    // Déterminer l'ID de l'utilisateur selon le type d'événement
    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else {
      uid = event.senderID;
    }

    try {
      // Récupérer le nom de l'utilisateur
      let name = await usersData.getName(uid);
      
      // Affichage standard pour éviter toute erreur de jeton (SyntaxError)
      const msg = `Nom : ${name}\nID : ${uid}`;

      // Envoyer le message avec le nom et l'ID
      await api.sendMessage({ body: msg }, event.threadID);

      let avt;
      if (event.messageReply) {
        avt = await usersData.getAvatarUrl(event.messageReply.senderID);
      } else if (event.attachments && event.attachments[0] && event.attachments[0].target && event.attachments[0].target.id) {
        avt = await usersData.getAvatarUrl(event.attachments[0].target.id);
      } else {
        avt = await usersData.getAvatarUrl(uid);
      }

      // Vérifier si l'URL de l'avatar a bien été récupérée
      if (!avt) {
        throw new Error("L'URL de l'avatar est introuvable.");
      }

      // Récupérer l'image de l'avatar sous forme de flux
      const attachment = await global.utils.getStreamFromURL(avt);
      if (!attachment) {
        throw new Error("Impossible de charger l'image de l'avatar.");
      }

      // Envoyer l'image de l'avatar
      await api.sendMessage({ body: "", attachment: attachment }, event.threadID);

      // Message de confirmation
      api.sendMessage("Contact partage avec succes.", event.threadID, event.messageID);
    } catch (error) {
      // Message d'erreur
      api.sendMessage("Erreur lors du partage du contact : " + error.message, event.threadID, event.messageID);
    }
  }
};
