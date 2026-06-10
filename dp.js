module.exports = {
	config: {
		name: "dp",
    aliases: ["pfp"],
		version: "1.0",
		author: "chris st",
		countDown: 5,
		role: 0,
		shortDescription: "pfp image",
		longDescription: "pfp image",
		category: "𝗜𝗡𝗙𝗢",
		guide: {
			en: "   {pn} @tag"
		}
	},

	onStart: async function ({ event, message, usersData, args, getLang }) {
    let avt;
		const uid1 = event.senderID;
		const uid2 = Object.keys(event.mentions)[0];
		if(event.type == "message_reply"){
      avt = await usersData.getAvatarUrl(event.messageReply.senderID)
    } else{
      if (!uid2){avt =  await usersData.getAvatarUrl(uid1)
              } else{avt = await usersData.getAvatarUrl(uid2)}}


		message.reply({
			body:"",
			attachment: await global.utils.getStreamFromURL(avt)
	})
  }
};