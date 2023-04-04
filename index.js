require("dotenv/config");

const Discord = require("discord.js");
const { Translate } = require("@google-cloud/translate").v2;

const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
const translate = new Translate({ key: apiKey });

const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

async function translateMessage(message) {
  try {
    const [translation] = await translate.translate(message, "my");
    return translation;
  } catch (err) {
    console.error(err);
    if (
      err.details &&
      err.details[0].metadata &&
      err.details[0].metadata.service ===
        "'API key not valid. Please pass a valid API key.'"
    ) {
      throw new Error("Invalid API key");
    } else {
      throw err;
    }
  }
}

client.on("ready", () => {
  console.log("LT-Translate is online");
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Connected to ${client.guilds.cache.size} servers`);
});

client.on("messageCreate", async (message) => {
  console.log(message);
  await message.channel.sendTyping();
  if (message.author.bot) return;

  if (message.content.startsWith("!test")) {
    message.channel.send("Hello world!");
  }

  if (message.content.startsWith("!translate ")) {
    const inputMessage = message.content.slice(11);
    try {
      const outputMessage = await translateMessage(inputMessage);
      message.channel.send(outputMessage);
    } catch (err) {
      console.error(err);
      if (err.message === "Invalid API key") {
        message.channel.send("API key not valid. Please pass a valid API key.");
      } else {
        message.channel.send("API key not valid. Please pass a valid API key.");
        console.error(err);
      }
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
