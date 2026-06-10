module.exports = {
	config: {
		name: "out",
		version: "1.0",
		author: "chris st",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "",
			en: "Fait quitter Minato du groupe."
		},
		longDescription: {
			vi: "",
			en: "Retirer Minato du groupe actuel ou d'un groupe spécifique."
		},
		category: "owner",
		guide: {
			vi: "",
			en: "out [ID du groupe]"
		}
	},

	onStart: async function ({ api, args, event }) {
		const botName = "Minato Namikaze";

		const leaveMessage = `🔔 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗧𝗢
𝗠𝗜𝗡𝗔𝗧𝗢 𝗡𝗔𝗠𝗜𝗞𝗔𝗭𝗘
━━━━━━━━━━━━━━━━━━━
╭┈ ❒ 👋 | 𝗗𝗘́𝗣𝗔𝗥𝗧 𝗗𝗨 𝗡𝗜𝗡𝗝𝗔
╰┈➤ À la demande de mon créateur Chris St, je dois me téléporter hors de ce groupe.

💬 Merci pour votre accueil au sein de votre alliance, que la volonté du Feu vous guide !

📆 𝗗𝗮𝘁𝗲 𝗻𝗼𝘄: ${new Date().toDateString()}
━━━━━━━━━━━━━━━━━━━
ℹ️ | Déplacement Hiraishin activé par 𝗠𝗜𝗡𝗔𝗧𝗢.`;

		if (!args[0]) {
			return api.sendMessage(
				leaveMessage,
				event.threadID,
				() => api.removeUserFromGroup(
					api.getCurrentUserID(),
					event.threadID
				)
			);
		}

		if (!isNaN(args[0])) {
			const targetThreadID = args.join(" ");
			return api.sendMessage(
				leaveMessage,
				targetThreadID,
				() => api.removeUserFromGroup(
					api.getCurrentUserID(),
					targetThreadID
				)
			);
		}
	}
};
