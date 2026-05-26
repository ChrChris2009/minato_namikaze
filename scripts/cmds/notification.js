const { getStreamsFromAttachment } = global.utils;

const botName = "Minato";

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "1.7",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		description: {
			vi: "Gửi thông báo từ admin đến all box",
			en: "Envoyer une notification à tous les groupes"
		},
		category: "owner",
		guide: {
			en: "{pn} <message>"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	langs: {
		en: {
			missingMessage:
`🚀 ❲ ${botName} Notification ❳ 🚀
━━━━━━━━━━━━━━━
╭── ⚠️ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗠𝗮𝗻𝗾𝘂𝗮𝗻𝘁 ───
│ 💬 Veuillez entrer
│ le message que vous
│ voulez envoyer à
│ tous les groupes.
│
│ 🤖 ${botName} attend
│ votre notification.
│
│ ✍️ Exemple :
│ notification Bonjour
╰──────────────────
━━━━━━━ ✕ ━━━━━━`,

			notification:
`🚀 ❲ ${botName} Notification ❳ 🚀
━━━━━━━━━━━━━━━
╭── 📢 𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 ───
│ 📡 Message officiel
│ envoyé par l'admin
│ de ${botName}.
│
│ ⚠️ Merci de ne pas
│ répondre à ce message.
╰──────────────────
━━━━━━━ ✕ ━━━━━━`,

			sendingNotification:
`🚀 ❲ ${botName} Notification ❳ 🚀
━━━━━━━━━━━━━━━
╭── 📤 𝗘𝗻𝘃𝗼𝗶 𝗘𝗻 𝗖𝗼𝘂𝗿𝘀 ───
│ 📡 ${botName} commence
│ l'envoi de la notification
│ vers %1 groupe(s).
╰──────────────────
━━━━━━━ ✕ ━━━━━━`,

			sentNotification:
`🚀 ❲ ${botName} Notification ❳ 🚀
━━━━━━━━━━━━━━━
╭── ✅ 𝗘𝗻𝘃𝗼𝗶 𝗥𝗲́𝘂𝘀𝘀𝗶 ───
│ 📡 ${botName} a envoyé
│ la notification avec
│ succès à %1 groupe(s).
╰──────────────────
━━━━━━━ ✕ ━━━━━━`,

			errorSendingNotification:
`🚀 ❲ ${botName} Notification ❳ 🚀
━━━━━━━━━━━━━━━
╭── ❌ 𝗘𝗿𝗿𝗲𝘂𝗿 ───
│ ⚠️ ${botName} n'a pas
│ pu envoyer le message
│ à %1 groupe(s).
│
│ 📌 Vérifiez les erreurs
│ affichées ci-dessous.
╰──────────────────
━━━━━━━ ✕ ━━━━━━

%2`
		}
	},

	onStart: async function ({
		message,
		api,
		event,
		args,
		commandName,
		envCommands,
		threadsData,
		getLang
	}) {

		const { delayPerGroup } = envCommands[commandName];

		if (!args[0])
			return message.reply(getLang("missingMessage"));

		const formSend = {
			body:
`${getLang("notification")}
━━━━━━━━━━━━━━━
╭── 💬 𝗠𝗲𝘀𝘀𝗮𝗴𝗲 ${botName} ───
│ ${args.join(" ")}
╰──────────────────`,
			attachment: await getStreamsFromAttachment(
				[
					...event.attachments,
					...(event.messageReply?.attachments || [])
				].filter(item =>
					["photo", "png", "animated_image", "video", "audio"]
						.includes(item.type)
				)
			)
		};

		const allThreadID = (await threadsData.getAll())
			.filter(
				t =>
					t.isGroup &&
					t.members.find(
						m => m.userID == api.getCurrentUserID()
					)?.inGroup
			);

		message.reply(
			getLang("sendingNotification", allThreadID.length)
		);

		let sendSucces = 0;

		const sendError = [];

		const wattingSend = [];

		for (const thread of allThreadID) {

			const tid = thread.threadID;

			try {

				wattingSend.push({
					threadID: tid,
					pending: api.sendMessage(formSend, tid)
				});

				await new Promise(resolve =>
					setTimeout(resolve, delayPerGroup)
				);

			}
			catch (e) {
				sendError.push(tid);
			}
		}

		for (const sended of wattingSend) {

			try {

				await sended.pending;

				sendSucces++;

			}
			catch (e) {

				const { errorDescription } = e;

				if (
					!sendError.some(
						item =>
							item.errorDescription == errorDescription
					)
				)

					sendError.push({
						threadIDs: [sended.threadID],
						errorDescription
					});

				else

					sendError.find(
						item =>
							item.errorDescription == errorDescription
					).threadIDs.push(sended.threadID);
			}
		}

		let msg = "";

		if (sendSucces > 0)

			msg += getLang(
				"sentNotification",
				sendSucces
			) + "\n";

		if (sendError.length > 0)

			msg += getLang(
				"errorSendingNotification",
				sendError.reduce(
					(a, b) => a + b.threadIDs.length,
					0
				),
				sendError.reduce(
					(a, b) =>
						a +
						`\n - ${b.errorDescription}\n  + ${b.threadIDs.join("\n  + ")}`,
					""
				)
			);

		message.reply(msg);
	}
};
