const axios = require('axios');

module.exports = {
  config: {
    name: "extract",
    aliases: ["extract"],
    version: 1.0,
    role: 2,
    author: "LiANE",
    shortDescription: { 
      en: "Reads and sends the content of a Pastebin link" 
    },
    category: "𝗢𝗪𝗡𝗘𝗥",
    guide: { 
      en: "{pn} <link> - Reads and sends the content of the given Pastebin link" 
    }
  },
  onStart: async function({ api, args, message }) {
    const link = args[0];
    if (!link || !link.startsWith("https://pastebin.com/raw/")) {
      message.reply("Invalid Pastebin link provided. Please provide a valid link starting with 'https://pastebin.com/raw/'.");
      return;
    }

    try {
      const response = await axios.get(link);
      const content = response.data;

      message.reply(content);
    } catch (error) {
      message.reply("An error occurred while trying to read the Pastebin link.");
      console.error(error);
    }
  }
};