const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require('discord.js');

const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

const PREFIX = '!';

// Anti-spam system
const spamMap = new Map();
const LIMIT = 5;
const TIME = 5000;

client.once('ready', () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.guild) return;

  // 🔥 Anti-spam
  const now = Date.now();
  if (!spamMap.has(msg.author.id)) spamMap.set(msg.author.id, []);

  let arr = spamMap.get(msg.author.id);
  arr.push(now);

  arr = arr.filter(t => now - t < TIME);
  spamMap.set(msg.author.id, arr);

  if (arr.length >= LIMIT) {
    try {
      await msg.member.timeout(600000, "Spam detected");
      msg.reply("🚫 Spam panna mute panniten");
    } catch {}
  }

  // Commands
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(1).split(" ");
  const cmd = args[0];

  // 🎧 Join VC
  if (cmd === "joinvc") {
    if (!msg.member.voice.channel)
      return msg.reply("❌ VC la join pannitu use pannunga");

    joinVoiceChannel({
      channelId: msg.member.voice.channel.id,
      guildId: msg.guild.id,
      adapterCreator: msg.guild.voiceAdapterCreator
    });

    msg.reply("🎧 VC la join aiten");
  }

  // ⚡ Reset Nickname
  if (cmd === "resetnick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return msg.reply("❌ Admin venum");

    const user = msg.mentions.members.first();
    if (!user) return msg.reply("❌ user mention pannunga");

    try {
      await user.setNickname(null);
      msg.reply("✅ Nickname reset panniten");
    } catch (err) {
      msg.reply("❌ Reset panna mudiyala");
    }
  }
});

// 🔐 Login
client.login(process.env.TOKEN);
