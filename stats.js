const { getStreamFromURL } = require("fb-watchman");

module.exports = {
  config: {
    name: "stats",
    aliases: ["date"],
    version: "1.0",
    author: "chris st",
    role: 0,
    shortDescription: {
      fr: "stats",
    },
    longDescription: {
      fr: "montre les statistiques de minato.",
    },
    category: "système",
    guide: {
      fr: "Utilisez {p}stats pour voir les statistiques du bot.",
    },
  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;

      const currentDate = new Date();
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      const date = currentDate.toLocaleDateString("fr-FR", options);
      const time = currentDate.toLocaleTimeString("fr-FR", {
        hour12: true,
      });

      const timeStart = Date.now();
      await api.sendMessage({
        body: "🔴⚫⚪....[𝙻𝚘𝚊𝚍]",
      }, event.threadID);

      const ping = Date.now() - timeStart;

      let pingStatus = "Pas très fluide avec ton routeur, mon ami.";
      if (ping < 400) {
        pingStatus = "Fluide comme un ninja dans la nuit.";
      }

      const imgURL = "https://i.imgur.com/yp5WqfT.jpeg";
      const attachment = await global.utils.getStreamFromURL(imgURL);

      api.sendMessage({
        body: `🟢 MINATO NAMIKAZE ⚫
────────────
〉﹝🌎 | 𝗕𝗢𝗧 𝚁𝚞𝚗𝚗𝚒𝚗𝚐 𝚃𝚒𝚖𝚎﹞
 ➤ ${uptimeString}
──────────── 
﹝📅 | 𝗗𝗔𝗧𝗘﹞: ${date}
────────────
⏰| 𝗧𝗜𝗠𝗘: ${time}
──────────── 
﹝👪 | 𝚃𝙾𝚃𝙰𝙻 𝗨𝗦𝗘𝗥𝗦﹞
➤ ${allUsers.length}
──────────── 
﹝🌸 | Total 𝗧𝗥𝗛𝗘𝗔𝗗𝗦﹞
➤ ${allThreads.length}
\n﹝📛 | 𝗣𝗜𝗡𝗚﹞: ${ping}ms
──────────── 
Ping status: ${pingStatus}`,
        attachment: attachment,
      }, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("Une erreur est survenue lors de la récupération des données.", event.threadID);
    }
  }
};
