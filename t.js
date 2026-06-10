const models = [
  'DreamShaper',
  'MBBXL_Ultimate',
  'Mysterious',
  'Copax_TimeLessXL',
  'Pixel_Art_XL',
  'ProtoVision_XL',
  'SDXL_Niji',
  'CounterfeitXL',
  'DucHaiten_AIart_SDXL'
];

module.exports = {
  config: {
    name: "t",
    version: "1.0",
    author: "chris st",
    countDown: 5,
    role: 0,
    longDescription: {
      vi: "",
      en: "Générer des images à partir d'un texte.",
    },
    category: "𝗔𝗜-𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗",
    guide: {
      vi: "",
      en: "Tapez {pn} avec votre description | (numéro du modèle)\nModèles supportés :\n" + models.map((item, index) => `${index + 1}. ${item}`).join('\n'),
    },
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      const text = args.join(" ");
      
      // 1. Menu d'aide Minato si aucun prompt n'est fourni
      if (!text) {
        return message.reply(`
╭━━━━━━━━━━━━━━━━━━━╮
┃ ⚡ MINATO NAMIKAZE AI
╰━━━━━━━━━━━━━━━━━━━╯

🖼️ Génération d'images IA

📝 Utilisation :
➜ t [description]

📌 Exemple :
➜ t Naruto Hokage en 4K

🎨 Choisir un modèle :
➜ t Naruto Hokage | 1

━━━━━━━━━━━━━━━━━━━
📚 Modèles disponibles :

${models.map((item, index) => `${index + 1}. ${item}`).join('\n')}

━━━━━━━━━━━━━━━━━━━
⚡ Réponse générée par Minato Namikaze
`);
      }

      let prompt, model;
      if (text.includes("|")) {
        const [promptText, modelText] = text.split("|").map((str) => str.trim());
        prompt = promptText;
        model = modelText;

        const modelNumber = parseInt(model);
        if (modelNumber >= 1 && modelNumber <= 9) {
          const modelNames = [
            'DreamShaper',
            'MBBXL_Ultimate',
            'Mysterious',
            'Copax_TimeLessXL',
            'Pixel_Art_XL',
            'ProtoVision_XL',
            'SDXL_Niji',
            'CounterfeitXL',
            'DucHaiten_AIart_SDXL'
          ];
          model = modelNames[modelNumber - 1];
        } else {
          // 2. Message d'erreur si le modèle est invalide
          return message.reply(`
❌ Modèle invalide.

📚 Modèles disponibles :

${models.map((item, index) => `${index + 1}. ${item}`).join('\n')}

💡 Exemple :
t Naruto Uzumaki | 1
`);
        }
      } else {
        prompt = text;
        model = "DreamShaper";
      }

      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      
      // 3. Message d'attente personnalisé
      const waitingMessage = await message.reply(`
╭━━━━━━━━━━━━━━━━━━━╮
┃ ⚡ MINATO NAMIKAZE
╰━━━━━━━━━━━━━━━━━━━╯

🎨 Création de votre image...

📝 Prompt :
${prompt}

🧠 Modèle :
${model}

⏳ Veuillez patienter...
`);

      const API = `https://www.api.vyturex.com/curios?prompt=${encodeURIComponent(prompt)}&modelType=${model}`;
      const imageStream = await global.utils.getStreamFromURL(API);

      await message.reply({
        attachment: imageStream,
      });
      
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await api.unsendMessage(waitingMessage.messageID);
      
    } catch (error) {
      // 4. Message d'erreur en cas de blocage par le filtre de sécurité
      message.reply(`
╭━━━━━━━━━━━━━━━━━━━╮
┃ ⚠️ MINATO NAMIKAZE
╰━━━━━━━━━━━━━━━━━━━╯

❌ Impossible de générer cette image.

🛡️ Le filtre de sécurité a bloqué la demande.

💡 Essayez une autre description.
`);
    }
  },
};
