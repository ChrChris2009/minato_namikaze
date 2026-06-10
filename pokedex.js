const fs = require('fs');

module.exports = {
  config: {
    name: "pokedex",
    version: "2.0",
    author: "Shikaki / Adaptation Minato",
    shortDescription: "Consulter la liste de tes Pokémon",
    longDescription: "Affiche les Pokémon attrapés par l'utilisateur avec la vitesse de l'Éclair Jaune.",
    category: "🐍 Pokémon",
    guide: "{pn} [page]",
  },

  onStart: async function ({ event, args, message }) {
    // Calcul de la date et de l'heure actuelles de la mission
    const optionsDate = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateNow = new Date().toLocaleDateString('fr-FR', optionsDate);
    const timeNow = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Chargement ou création de la base de données
    let pokedb;
    try {
      pokedb = JSON.parse(fs.readFileSync('pokedb.json', 'utf8'));
    } catch (err) {
      pokedb = { users: {} };
      fs.writeFileSync('pokedb.json', JSON.stringify(pokedb, null, 2), 'utf8');
    }

    const senderID = event.senderID;

    // Vérification si l'utilisateur existe et s'il possède des Pokémon
    if (!pokedb.users[senderID] || !pokedb.users[senderID].pokemons || pokedb.users[senderID].pokemons.length === 0) {
      if (!pokedb.users[senderID]) {
        pokedb.users[senderID] = { pokemons: [] };
        fs.writeFileSync('pokedb.json', JSON.stringify(pokedb, null, 2), 'utf8');
      }

      const emptyReply = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 
 MINATO NAMIKAZE 
━━━━━━━━━━━━━━━━━━━
👤 𝖠𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾rer:
• Kyle
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ Oh ? On dirait que ton Pokédex est encore vide, jeune ninja. 🍃 Ne baisse pas les bras, l'aventure commence à peine ! Pars explorer le monde pour capturer tes premiers compagnons.
━━━━━━━━━━━━━━━━━━━
ℹ️ | Rapport automatique de l'éclair jaune de Konoha.`;
      return message.reply(emptyReply);
    }

    // Gestion de la pagination
    let pageNumber = 1;
    if (args[0]) {
      pageNumber = parseInt(args[0]);
    }

    if (pageNumber < 1 || isNaN(pageNumber)) {
      return message.reply("⚡ *Erreur de l'Éclair Jaune :* Ce numéro de page n'est pas valide. entre un nombre correct !");
    }

    // Récupération et tri de la liste de Pokémon de l'utilisateur
    let userPokedex = pokedb.users[senderID].pokemons;
    userPokedex = userPokedex.sort((a, b) => a.localeCompare(b));

    const maxDisplay = 20;
    const totalPages = Math.ceil(userPokedex.length / maxDisplay);

    if (pageNumber > totalPages) {
      return message.reply(`🍃 Tu as tenté d'aller trop vite ! Tu n'as pas autant de pages. Ta limite actuelle est la page ${totalPages}.`);
    }

    // Sélection des Pokémon pour la page demandée
    const startIndex = (pageNumber - 1) * maxDisplay;
    const endIndex = startIndex + maxDisplay;
    const pokemonSubset = userPokedex.slice(startIndex, endIndex);

    // Formatage de la liste
    let formattedNames = '';
    for (let i = 0; i < pokemonSubset.length; i++) {
      const pokemonName = pokemonSubset[i];
      formattedNames += `  ⚡ ${startIndex + i + 1}. ${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}\n`;
    }

    // Ajout de l'indicateur de page suivante ou de fin
    if (pageNumber < totalPages) {
      formattedNames += `\n💡 *Pour voir la suite, utilise la commande : "pokedex ${pageNumber + 1}".*`;
    } else {
      formattedNames += "\n🍃 *C'est tout ce que tu as pour le moment ! Continue tes efforts pour enrichir ta collection.*";
    }

    // Construction finale du message avec ton style
    const finalReply = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢 
 MINATO NAMIKAZE 
━━━━━━━━━━━━━━━━━━━
👤 𝖠𝖽𝗆𝗂𝗇/𝖮𝗐𝗇𝖾𝗋:
• chris st
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 📬 | 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:
╰┈➤ Salutations ! Voici un aperçu des forces de ton Pokédex :

${formattedNames}

📖 𝗣𝗮𝗴𝗲 : ${pageNumber}/${totalPages}
⏰ 𝗧𝗶𝗺𝗲 𝗻𝗼𝘄: ${timeNow}
📆 𝗗𝗮𝘁ε 𝗻𝗼𝘄: ${dateNow}
━━━━━━━━━━━━━━━━━━━
ℹ️ | Rapport de mission généré avec succès par l'𝗔𝗗𝗠𝗜𝗡𝗕𝗢𝗧.`;

    return message.reply(finalReply);
  }
};
