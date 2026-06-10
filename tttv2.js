const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// Cache temporaire pour éviter de re-télécharger les avatars à chaque tour
const playerCache = new Map();
const BOT_UID = global.botID || "100000000000000"; // Sécurité si global.botID est indéfini
const BOT_NAME = "Minato Namikaze";

// Initialisation globale de l'objet game si non existant
if (!global.game) {
  global.game = {};
}

module.exports = {
  config: {
    name: "tttv2",
    aliases: ['tictactoev2', 'morpionv2'],
    version: "2.0",
    author: "chris st",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "",
      en: "Jouer au morpion (Tic-Tac-Toe) sur un plateau Canvas ultra-pro."
    },
    longDescription: {
      vi: "",
      en: "Affrontez vos amis dans un duel de Morpion légendaire arbitré par Minato Namikaze."
    },
    category: "game",
    guide: "{pn} <@mention> ou {pn} close",
  },

  onStart: async function ({ event, message, api, usersData, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const mention = Object.keys(event.mentions);

    // ==========================================
    // ACTION : FERMER UNE PARTIE EXISTANTE
    // ==========================================
    if (args[0] === "close") {
      if (!global.game.hasOwnProperty(threadID) || global.game[threadID].on === false) {
        return message.reply(`⚡ Aucun affrontement n'est en cours dans cette zone.`);
      }

      const game = global.game[threadID];
      if (senderID === game.player1.id || senderID === game.player2.id) {
        let loserName, winnerName, loserId, winnerId;

        if (senderID === game.player1.id) {
          loserName = game.player1.name;
          loserId = game.player1.id;
          winnerName = game.player2.name;
          winnerId = game.player2.id;
        } else {
          loserName = game.player2.name;
          loserId = game.player2.id;
          winnerName = game.player1.name;
          winnerId = game.player1.id;
        }
        message.reply({
          body: `🍁 Des déserteurs au milieu du combat ?\n\n${loserName} a fui le champ de bataille !\n🏆 Victoire accordée par forfait à ${winnerName}.`,
          mentions: [
            { tag: loserName, id: loserId },
            { tag: winnerName, id: winnerId }
          ]
        });

        global.game[threadID].on = false;
        return;
      } else {
        return message.reply(`❌ Seuls les combattants actifs peuvent mettre fin à ce duel.`);
      }
    }

    // ==========================================
    // ACTION : CRÉER OU LANCER UNE PARTIE
    // ==========================================
    if (mention.length === 0) {
      return message.reply(`⚡ Pour lancer un défi, mentionnez un ninja de votre choix !\n💡 Exemple : \`tttv2 @ami\` ou écrivez \`tttv2 close\` pour clore une partie.`);
    }

    if (!global.game.hasOwnProperty(threadID) || global.game[threadID].on === false) {
      const p1_id = mention[0];
      const p2_id = senderID;

      // Récupération des noms
      const p1_name = await usersData.getName(p1_id) || `Shinobi`;
      const p2_name = await usersData.getName(p2_id) || `Shinobi`;

      // Création de l'état de la partie
      global.game[threadID] = {
        on: true,
        board: Array(9).fill(null), // Structure de tableau standard propre
        avcell: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        turn: p1_id, // C'est la personne mentionnée qui commence
        player1: { id: p1_id, name: p1_name, symbol: "❌" },
        player2: { id: p2_id, name: p2_name, symbol: "⭕" },
        bidd: "❌",
        bid: "",
        counting: 0
      };

      // Notification de début & Génération du premier plateau Canvas graphique
      const initialWaiting = await message.reply("⚡ L'Éclair Jaune de Konoha prépare l'arène de combat... Veuillez patienter.");
      
      try {
        const boardBuf = await generateBoardImage(
          global.game[threadID].board, 
          global.game[threadID].player1, 
          [global.game[threadID].player1, global.game[threadID].player2], 
          usersData
        );

        await api.unsendMessage(initialWaiting.messageID);

        message.send({
          body: `╭━━━━━━━━━━━━━━━━━━━╮\n┃ ⚡ MINATO NAMIKAZE AI\n╰━━━━━━━━━━━━━━━━━━━╯\n\n⚔️ Un duel légendaire commence !\n\n🔴 Répondez à ce message avec un chiffre entre 1 et 9 pour poser votre marque.\n\n🥋 À toi l'honneur : ${p1_name}`,
          attachment: boardBuf
        }, (err, info) => {
          if (!err) global.game[threadID].bid = info.messageID;
        });

      } catch (e) {
        console.error(e);
        await api.unsendMessage(initialWaiting.messageID);
        message.reply("❌ Une erreur est survenue lors de la modélisation graphique de l'arène.");
      }

    } else {
      message.reply("⚔️ Une bataille fait déjà rage dans ce groupe. Terminez-la d'abord !");
    }
  },

  onChat: async function ({ event, message, api, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // Détection basique pour le trigger drôle demandé ("-,-")
    if (event.type === "message" && event.body && event.body.includes("-,-")) {
      try {
        const imgStream = await global.utils.getStreamFromURL("https://scontent.xx.fbcdn.net/v/t1.15752-9/316181740_667600474745895_5536856546858630902_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=ae9488&_nc_ohc=bR-GcvE6RHMAX_YE5bu&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=03_AdQk45VA6QO5_X5vTQJYdXF4nH45UeESYppxrFbZdRlJMw&oe=63A3009D");
        message.reply({ body: "Hehe baka 😜 !", attachment: imgStream });
      } catch (e) {}
    }

    // Gestion de la réponse de jeu par le système de reply
    if (event.type === "message_reply" && global.game[threadID] && global.game[threadID].on === true) {
      const game = global.game[threadID];

      // Vérifier si le reply vise bien le dernier message envoyé par le bot morpion
      if (event.messageReply.messageID === game.bid) {
        
        // Vérifier si c'est le tour de l'expéditeur
        if (game.turn !== senderID) {
          return message.reply("🥋 Patience... Ce n'est pas encore ton tour dans cette confrontation !");
        }

        const choice = event.body ? event.body.trim() : "";
        if (!["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(choice)) {
          return message.reply("💡 Tu dois envoyer un chiffre unique entre 1 et 9 pour marquer une case valide.");
        }

        if (!game.avcell.includes(choice)) {
          return message.reply("❌ Cette zone a déjà été scellée par un symbole. Choisis-en une autre !");
        }
        
        // Mettre à jour les cases disponibles et le tableau abstrait
        game.avcell.splice(game.avcell.indexOf(choice), 1);
        const cellIndex = parseInt(choice) - 1;
        game.board[cellIndex] = game.bidd;

        // Effacer l'ancien message pour éviter le spam visuel de l'arène
        try { api.unsendMessage(event.messageReply.messageID); } catch(e) {}

        // Vérification de victoire ou d'égalité
        const winnerSymbol = checkWinner(game.board);
        const isDraw = !winnerSymbol && game.board.every(cell => cell !== null);

        if (winnerSymbol || isDraw) {
          game.on = false; // Désactiver la partie
          
          try {
            const endBuf = await generateEndGameImage(game.board, winnerSymbol ? (game.turn === game.player1.id ? game.player1 : game.player2) : null, [game.player1, game.player2], usersData, isDraw);
            
            if (winnerSymbol) {
              const winnerName = game.turn === game.player1.id ? game.player1.name : game.player2.name;
              const winnerId = game.turn === game.player1.id ? game.player1.id : game.player2.id;
              
              message.send({
                body: `╭━━━━━━━━━━━━━━━━━━━╮\n┃ ⚡ MINATO NAMIKAZE AI\n╰━━━━━━━━━━━━━━━━━━━╯\n\n🏆 FIN DU DUEL !\nFélicitations à ${winnerName} pour sa superbe stratégie ! Tu gagnes ce match !`,
                mentions: [{ tag: winnerName, id: winnerId }],
                attachment: endBuf
              });
            } else {
              message.send({
                body: `╭━━━━━━━━━━━━━━━━━━━╮\n┃ ⚡ MINATO NAMIKAZE AI\n╰━━━━━━━━━━━━━━━━━━━╯\n\n🤝 Égalité parfaite ! Vos forces s'équilibrent à la perfection comme le Yin et le Yang.`,
                attachment: endBuf
              });
            }
          } catch (e) {
            console.error(e);
            message.reply(winnerSymbol ? `🏆 Fin du match ! Le vainqueur est déclaré !` : `🤝 Match nul !`);
          }
        } else {
          // Inversion des rôles pour le tour suivant
          game.counting += 1;
          
          if (game.turn === game.player1.id) {
            game.turn = game.player2.id;
            game.bidd = "⭕";
          } else {
            game.turn = game.player1.id;
            game.bidd = "❌";
          }
          const nextPlayer = game.turn === game.player1.id ? game.player1 : game.player2;

          // Génération et envoi de la nouvelle arène mise à jour
          try {
            const boardBuf = await generateBoardImage(game.board, nextPlayer, [game.player1, game.player2], usersData);
            
            message.send({
              body: `⏳ Tour suivant !\n\n🥋 À ton tour de jouer : ${nextPlayer.name} (${game.bidd})`,
              attachment: boardBuf
            }, (err, infos) => {
              if (!err) game.bid = infos.messageID;
            });
          } catch (e) {
            message.reply(`🥋 Tour suivant ! À toi de jouer : ${nextPlayer.name}`);
          }
        }
      }
    }
  }
};

// =========================================================================
//  FONCTIONS TECHNIQUES EXTERNES & MOTEUR GRAPHIQUE CANVAS (ULTRA PRO)
// =========================================================================

function checkWinner(board) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
    [0, 4, 8], [2, 4, 6]             // Diagonales
  ];
  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

async function getPlayerInfo(uid, usersData) {
  const nuid = Number(uid);
  if (isNaN(nuid)) return { avatar: null, name: `Ninja`, uid };
  if (playerCache.has(nuid)) return playerCache.get(nuid);

  try {
    // Récupération obligatoire et propre de l'avatar Facebook de l'utilisateur
    const avatar = await loadImage(`https://graph.facebook.com/${nuid}/picture?width=512&height=512`);
    const name = (await usersData.getName(nuid)) || `Shinobi ${nuid}`;
    const info = { avatar, name, uid: nuid };
    
    playerCache.set(nuid, info);
    setTimeout(() => playerCache.delete(nuid), 300000); // Expiration du cache après 5 min
    return info;
  } catch {
    const name = (await usersData.getName(nuid)) || `Shinobi ${nuid}`;
    const info = { avatar: null, name, uid: nuid };
    playerCache.set(nuid, info);
    return info;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function generateBoardImage(board, currentPlayer, players, usersData) {
  const W = 1400, H = 1060;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Dégradé de fond futuriste/ninja de haute qualité
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0a0714");
  bg.addColorStop(0.5, "#131026");
  bg.addColorStop(1, "#0a071c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grille de fond texturée subtile
  ctx.fillStyle = "rgba(255,255,255,0.02)";
  for (let x = 0; x < W; x += 34) {
    for (let y = 0; y < H; y += 34) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // En-tête personnalisé
  ctx.font = "bold 44px 'Courier New'";
  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "center";
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 16;
  ctx.fillText("✦ ARÈNE DE MINATO NAMIKAZE ✦", W / 2, 68);
  ctx.shadowBlur = 0;

  const playerInfos = await Promise.all(players.map(p => getPlayerInfo(p.id, usersData)));

  const BOARD_SIZE = 540;
  const bx = W / 2 - BOARD_SIZE / 2;
  const by = 130;

  // Boîte de fond pour la grille
  ctx.fillStyle = "rgba(15,12,35,0.85)";
  roundRect(ctx, bx - 18, by - 18, BOARD_SIZE + 36, BOARD_SIZE + 36, 20);
  ctx.fill();
  ctx.strokeStyle = "rgba(251,191,36,0.4)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Lignes internes de la grille
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 1; i <= 2; i++) {
    ctx.moveTo(bx + (BOARD_SIZE / 3) * i, by);
    ctx.lineTo(bx + (BOARD_SIZE / 3) * i, by + BOARD_SIZE);
    ctx.moveTo(bx, by + (BOARD_SIZE / 3) * i);
    ctx.lineTo(bx + BOARD_SIZE, by + (BOARD_SIZE / 3) * i);
  }
  ctx.stroke();
  // Dessin des cases (Chiffres, X ou O)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3), col = i % 3;
    const cx = bx + col * (BOARD_SIZE / 3) + BOARD_SIZE / 6;
    const cy = by + row * (BOARD_SIZE / 3) + BOARD_SIZE / 6;
    
    if (board[i] === "❌") {
      ctx.font = "bold 100px 'Courier New'";
      ctx.shadowColor = "#f87171"; ctx.shadowBlur = 22;
      ctx.fillStyle = "#f87171"; ctx.fillText("❌", cx, cy);
      ctx.shadowBlur = 0;
    } else if (board[i] === "⭕") {
      ctx.font = "bold 100px 'Courier New'";
      ctx.shadowColor = "#34d399"; ctx.shadowBlur = 22;
      ctx.fillStyle = "#34d399"; ctx.fillText("⭕", cx, cy);
      ctx.shadowBlur = 0;
    } else {
      ctx.font = "bold 32px 'Courier New'";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillText(String(i + 1), cx, cy);
    }
  }
  ctx.textBaseline = "alphabetic";

  // Dessin des deux panneaux latéraux des profils joueurs
  const PANEL_W = 320, PANEL_H = 480;
  for (let i = 0; i < 2; i++) {
    const info = playerInfos[i];
    const pdata = players[i];
    const isCurrent = currentPlayer?.id === pdata.id;
    const px = i === 0 ? 55 : W - PANEL_W - 55;
    const py = 120;

    const panelG = ctx.createLinearGradient(px, py, px, py + PANEL_H);
    panelG.addColorStop(0, isCurrent ? "rgba(251,191,36,0.2)" : "rgba(20,18,45,0.7)");
    panelG.addColorStop(1, isCurrent ? "rgba(251,191,36,0.05)" : "rgba(10,8,25,0.7)");
    ctx.fillStyle = panelG;
    roundRect(ctx, px, py, PANEL_W, PANEL_H, 24);
    ctx.fill();
    ctx.strokeStyle = isCurrent ? "#fbbf24" : "rgba(255,255,255,0.12)";
    ctx.lineWidth = isCurrent ? 3 : 1.5;
    ctx.stroke();

    // Insertion obligatoire de l'avatar circulaire de l'utilisateur
    if (info.avatar) {
      const ax = px + PANEL_W / 2, ay = py + 100;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, 70, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(info.avatar, ax - 70, ay - 70, 140, 140);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(ax, ay, 72, 0, Math.PI * 2);
      ctx.strokeStyle = pdata.symbol === "❌" ? "#f87171" : "#34d399";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.font = "bold 26px 'Courier New'";
    ctx.fillStyle = isCurrent ? "#ffffff" : "#9ca3af";
    ctx.textAlign = "center";
    ctx.fillText(info.name.substring(0, 15), px + PANEL_W / 2, py + 220);

    ctx.font = "bold 56px 'Courier New'";
    ctx.fillStyle = pdata.symbol === "❌" ? "#f87171" : "#34d399";
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
    ctx.fillText(pdata.symbol, px + PANEL_W / 2, py + 300);
    ctx.shadowBlur = 0;
    if (isCurrent) {
      ctx.font = "bold 22px 'Courier New'";
      ctx.fillStyle = "#fbbf24";
      ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 10;
      ctx.fillText("⮞ À SON TOUR", px + PANEL_W / 2, py + PANEL_H - 40);
      ctx.shadowBlur = 0;
    }
  }

  // Affichage du statut en bas au centre
  ctx.textAlign = "center";
  ctx.font = "bold 34px 'Courier New'";
  ctx.fillStyle = "#e0e7ff";
  ctx.fillText(`Stratège actif : ${currentPlayer.name}`, W / 2, by + BOARD_SIZE + 60);

  ctx.font = "14px 'Courier New'";
  ctx.fillStyle = "rgba(251,191,36,0.3)";
  ctx.fillText("MINATO NAMIKAZE AI • SYSTÈME DU MORPION", W / 2, H - 20);

  return canvas.toBuffer("image/png");
}

async function generateEndGameImage(board, winner, players, usersData, isDraw) {
  const W = 1400, H = 1000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, isDraw ? "#050d18" : "#06100a");
  bg.addColorStop(1, "#07050f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const borderG = ctx.createLinearGradient(0, 0, W, H);
  borderG.addColorStop(0, isDraw ? "#60a5fa" : "#34d399");
  borderG.addColorStop(1, isDraw ? "#3b82f6" : "#10b981");
  ctx.strokeStyle = borderG;
  ctx.lineWidth = 4;
  roundRect(ctx, 15, 15, W - 30, H - 30, 20);
  ctx.stroke();

  const playerInfos = await Promise.all(players.map(p => getPlayerInfo(p.id, usersData)));
  const BOARD_SIZE = 420;
  const bx = W / 2 - BOARD_SIZE / 2;
  const by = 120;

  // Recréation simplifiée du plateau de fin
  ctx.fillStyle = "rgba(10,8,25,0.85)";
  roundRect(ctx, bx - 16, by - 16, BOARD_SIZE + 32, BOARD_SIZE + 32, 18);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 1; i <= 2; i++) {
    ctx.moveTo(bx + (BOARD_SIZE / 3) * i, by);
    ctx.lineTo(bx + (BOARD_SIZE / 3) * i, by + BOARD_SIZE);
    ctx.moveTo(bx, by + (BOARD_SIZE / 3) * i);
    ctx.lineTo(bx + BOARD_SIZE, by + (BOARD_SIZE / 3) * i);
  }
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3), col = i % 3;
    const cx = bx + col * (BOARD_SIZE / 3) + BOARD_SIZE / 6;
    const cy = by + row * (BOARD_SIZE / 3) + BOARD_SIZE / 6;
    if (board[i] === "❌") {
      ctx.font = "bold 80px 'Courier New'";
      ctx.fillStyle = "#f87171"; ctx.fillText("❌", cx, cy);
    } else if (board[i] === "⭕") {
      ctx.font = "bold 80px 'Courier New'";
      ctx.fillStyle = "#34d399"; ctx.fillText("⭕", cx, cy);
    }
  }
  ctx.textBaseline = "alphabetic";

  // Profils finaux des joueurs
  const PANEL_W = 300, PANEL_H = 180;
  for (let i = 0; i < 2; i++) {
    const info = playerInfos[i];
    const pdata = players[i];
    const isWin = winner && winner.id === pdata.id;
    const px = i === 0 ? 120 : W - PANEL_W - 120;
    const py = by + BOARD_SIZE + 70;

    ctx.fillStyle = isWin ? "rgba(251,191,36,0.18)" : "rgba(20,18,45,0.7)";
    roundRect(ctx, px, py, PANEL_W, PANEL_H, 18);
    ctx.fill();
    ctx.strokeStyle = isWin ? "#fbbf24" : "rgba(255,255,255,0.12)";
    ctx.lineWidth = isWin ? 3 : 1.5;
    ctx.stroke();

    if (info.avatar) {
      const ax = px + 55, ay = py + PANEL_H / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, 44, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(info.avatar, ax - 44, ay - 44, 88, 88);
      ctx.restore();
    }

    ctx.font = "bold 22px 'Courier New'";
    ctx.fillStyle = isWin ? "#fbbf24" : "#e0e7ff";
    ctx.textAlign = "left";
    ctx.fillText(info.name.substring(0, 12), px + 115, py + 60);

    ctx.font = "bold 32px 'Courier New'";
    ctx.fillStyle = pdata.symbol === "❌" ? "#f87171" : "#34d399";
    ctx.fillText(pdata.symbol, px + 115, py + 110);
    
    if (isWin) {
      ctx.font = "bold 16px 'Courier New'";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText("🏆 VAINQUEUR", px + 115, py + 145);
    }
  }

  ctx.font = "bold 54px 'Courier New'";
  ctx.textAlign = "center";
  ctx.fillStyle = isDraw ? "#60a5fa" : "#fbbf24";
  ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 15;
  ctx.fillText(isDraw ? "══ MATCH NUL ══" : "══ VICTOIRE ÉTINCELANTE ══", W / 2, by + BOARD_SIZE + 40);
  ctx.shadowBlur = 0;

  return canvas.toBuffer("image/png");
}