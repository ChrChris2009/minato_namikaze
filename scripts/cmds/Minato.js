const axios = require('axios');

// Système de mémoire locale pour stocker l'historique des conversations par utilisateur
if (!global.minatoMemory) {
  global.minatoMemory = new Map();
}

module.exports = {
  config: {
    name: "minato",
    version: "1.1.0",
    author: "Chris St",
    countDown: 5,
    role: 0,
    description: "Interagir avec Minato Namikaze avec mémoire de conversation",
    category: "ai",
    guide: {
      en: "{p}minato [votre question]"
    }
  },

  onStart: async function ({ message, args, event }) {
    const senderID = event.senderID;
    const query = args.join(" ").toLowerCase().trim();

    if (!query) {
      return message.reply("Bonjour ! Je suis Minato Namikaze. Posez-moi votre question après la commande.");
    }

    // 1. Filtrage du contenu sensible / pornographie
    const badWords = ["porno", "porn", "sexe", "hentai", "xrated", "nude", "nu ", "creampie"];
    if (badWords.some(word => query.includes(word))) {
      return message.reply("Désolé, je ne peux pas répondre aux questions concernant la pornographie.");
    }

    // 2. Gestion des questions sur le créateur
    if (query.includes("créateur") || query.includes("createur") || query.includes("t'a fait") || query.includes("t'a créé")) {
      return message.reply("Mon créateur est Chris St.");
    }

    // 3. Gestion des questions sur son identité / nom
    if (query.includes("qui es-tu") || query.includes("ton nom") || query.includes("tu t'appelles comment")) {
      return message.reply("Je m'appelle Minato Namikaze.");
    }

    // 4. Gestion de l'heure exacte (Même si on bascule en 2089)
    if (query.includes("l'heure") || query.includes("quelle heure") || query.includes("date")) {
      let date = new Date();
      let heure = date.getHours().toString().padStart(2, '0');
      let minutes = date.getMinutes().toString().padStart(2, '0');
      let jour = date.getDate().toString().padStart(2, '0');
      let mois = (date.getMonth() + 1).toString().padStart(2, '0');
      
      let annee = date.getFullYear();
      if (query.includes("2089")) {
        annee = 2089;
      }

      return message.reply(`Il est exactement ${heure}:${minutes} le ${jour}/${mois}/${annee}.`);
    }

    // --- AJOUT : Réaction de réflexion au début de la recherche ---
    if (typeof message.reaction === "function") {
      await message.reaction("⏳", event.messageID);
    }

    // 5. Gestion de la mémoire et construction du contexte
    if (!global.minatoMemory.has(senderID)) {
      global.minatoMemory.set(senderID, []);
    }
    
    let userHistory = global.minatoMemory.get(senderID);
    
    // Ajouter le nouveau message de l'utilisateur à l'historique
    userHistory.push(`Utilisateur: ${args.join(" ")}`);

    // Limiter la mémoire aux 10 derniers messages pour éviter de saturer l'API
    if (userHistory.length > 10) {
      userHistory.shift();
    }

    // Construire le texte final incluant le contexte passé
    const fullPrompt = userHistory.join("\n") + "\nMinato:";

    // 6. Appel à l'API
    try {
      const response = await axios.get(`https://apk555-gb2z.vercel.app/api/gpt?q=${encodeURIComponent(fullPrompt)}`);
      
      if (response.data && response.data.message) {
        const replyMessage = response.data.message;
        
        // Ajouter la réponse de Minato à la mémoire pour le prochain tour
        userHistory.push(`Minato: ${replyMessage}`);
        global.minatoMemory.set(senderID, userHistory);

        // --- AJOUT : Changement de la réaction quand le message part ---
        if (typeof message.reaction === "function") {
          await message.reaction("✅", event.messageID);
        }

        return message.reply(replyMessage);
      } else {
        if (typeof message.reaction === "function") {
          await message.reaction("❌", event.messageID);
        }
        return message.reply("Désolé, je n'ai pas pu obtenir de réponse de mon système central.");
      }
    } catch (error) {
      console.error(error);
      if (typeof message.reaction === "function") {
        await message.reaction("❌", event.messageID);
      }
      return message.reply("Une erreur est survenue lors de la connexion à l'API.");
    }
  }
};
