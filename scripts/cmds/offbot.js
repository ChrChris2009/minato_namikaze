module.exports = {
  config: {
    name: "offbot",
    version: "1.0",
    author: "MR.AYAN",
    countDown: 45,
    role: 0,
    shortDescription: "Turn off bot",
    longDescription: "Turn off bot",
    category: "owner",
    guide: "{p}{n}"
  },
  onStart: async function ({event, api}) {
    const permission = [ "100063487970328" ];
  if (!permission.includes(event.senderID)) {
    api.sendMessage("𝗬𝗼𝘂 𝗗𝗼𝗻𝘁 𝗛𝗮𝘃𝗲 𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻 𝗧𝗼 𝗨𝘀𝗲 𝗧𝗵𝗶𝘀 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 .", event.threadID, event.messageID);
    return;
  }
    api.sendMessage("𝗦𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆 𝗧𝘂𝗿𝗻 𝗢𝗳𝗳 𝗦𝘆𝘀𝘁𝗲𝗺 ✅",event.threadID, () =>process.exit(0))}
};
