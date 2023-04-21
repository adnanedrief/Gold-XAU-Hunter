const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"],
});
const axios = require("axios");
const config = require("./config.json");

// Default values
let threshold = 0.0001; // in percentage
let defaultChannel = "general";
let notificationInterval = 60000; // in milliseconds
let prefix = "!";
let includeNews = false;
let includePrices = false;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (message) => {
  if (message.author.bot) return;

  if (message.content === `${prefix}help`) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Available Commands")
      .addField(`${prefix}help`, "Get a list of available commands.")
      .addField(
        `${prefix}setchannel <channel name>`,
        "Set the channel where notifications will be sent."
      )
      .addField(
        `${prefix}setthreshold <percentage>`,
        "Set the percentage threshold for price change notifications."
      )
      .addField(
        `${prefix}setnotificationtime <minute>`,
        "Set the time when notifications will be sent."
      )
      .addField(
        `${prefix}goldpricesonly`,
        "Receive notifications for gold prices only."
      )
      .addField(
        `${prefix}goldnewsonly`,
        "Receive notifications for news about gold only."
      )
      .addField(
        `${prefix}both`,
        "Receive notifications for both gold prices and news."
      )
      .addField(`${prefix}getgoldpricenow`, "Get the current gold price.")
      .addField(`${prefix}getgoldnewsnow`, "Get the latest news about gold.")
      .setColor("#F1C40F");
    message.channel.send({
      embeds: [embed],
    });
  }

  if (message.content.startsWith(`${prefix}setchannel`)) {
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply("Invalid channel!");
    defaultChannel = channel.name;
    message.reply(`Alerts will be sent to ${channel} from now on.`);
  }
  if (message.content.startsWith(`${prefix}setthreshold`)) {
    const percentage = message.content.split(" ")[1];
    if (!Number(percentage)) {
      message.reply(`Please enter a valid number for percentage threshold.`);
    } else {
      threshold = parseInt(percentage);
      message.reply(`Percentage threshold set to ${threshold}%.`);
    }
  }
  if (message.content.startsWith(`${prefix}setnotificationtime`)) {
    const [interval] = message.content.split(" ").slice(1);
    if (!Number(interval) || interval < 1) {
      message.reply(
        `Please enter a valid positive integer for the notification interval in minutes.`
      );
    } else {
      notificationInterval = parseInt(interval) * 60 * 1000; // convert minutes to milliseconds
      message.reply(`Notification interval set to ${interval} minutes.`);
    }
  }

  if (message.content === `${prefix}goldpricesonly`) {
    includeNews = false;
    includePrices = true;
    message.reply("You will now receive notifications for gold prices only.");
    runBot(includeNews, includePrices);
  }
  if (message.content === `${prefix}goldnewsonly`) {
    includePrices = false;
    includeNews = true;
    message.reply(
      "You will now receive notifications for news about gold only."
    );
    runBot(includeNews, includePrices);
  }
  if (message.content === `${prefix}both`) {
    includeNews = true;
    includePrices = true;
    message.reply(
      "You will now receive notifications for both gold prices and news."
    );
    runBot(includeNews, includePrices);
  }
  if (message.content === `${prefix}getgoldpricenow`) {
    const goldData = await getGoldPrices();
    const price = goldData.price;
    message.reply(`The current gold price is **$${price}** per ounce.`);
  }

  if (message.content === `${prefix}getgoldnewsnow`) {
    const newsData = await getGoldNews();
    const articles = newsData.articles.slice(0, 8);
    const headlines = formatHeadlines(articles);
    message.reply(`The latest gold news is:\n\n${headlines}`);
  }
});

const getGoldNews = async () => {
  try {
    const response = await axios.get(
      "https://newsapi.org/v2/everything?q=stock+market+XAU&language=en",
      {
        headers: {
          Authorization: `Bearer ${config.NEWS_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const formatHeadlines = (articles) => {
  let message = "";
  articles.forEach((article, index) => {
    message += `${index + 1}. ${article.title}\n${article.url}\n\n`;
  });
  return message;
};

const getGoldPrices = async () => {
  try {
    const response = await axios.get("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": "goldapi-1k456rlgoeiy1f-io",
      },
    });
    //console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const sendNotification = async (includeNews, includePrices) => {
  let message = "";
  if (includeNews) {
    console.log("sending news alert");
    const newsData = await getGoldNews(); 
    const articles = newsData.articles.slice(0, 8);
    message += `**[ Gold News Alert ]**\n\n${formatHeadlines(articles)}\n`;
    console.log("done sending news alert");
  }
  if (includePrices) {
    console.log("sending price alert");
    let goldData = "";
    try {
      const response = await axios.get("https://www.goldapi.io/api/XAU/USD", {
        headers: {
          "x-access-token": config.GOLD_API_KEY,
        },
      });
      goldData = response.data;
      console.log("done sending price alert");
    } catch (error) {
      console.error(error);
    }
    //console.log("goldData ==>" + Object.keys(goldData));;
    const oldPriceData = goldData.prev_close_price;
    const newPriceData = goldData.price;
    const priceChange = ((newPriceData - oldPriceData) / oldPriceData) * 100;
    if (Math.abs(priceChange) >= threshold) {
      message += `**[ Gold Prices Alert ]**\n\n`;
      if (priceChange > 0) {
        message += `Gold prices are up by ${priceChange.toFixed(2)}%**\n`;
      } else {
        message += `Gold prices are **down by ${Math.abs(priceChange).toFixed(
          2
        )}%**\n`;
      }
      message += `**Old price:** $${oldPriceData.toFixed(
        2
      )}\n**New price:** $${newPriceData.toFixed(2)}`;
    }
  }

  if (message) {
    const channel = client.channels.cache.find(
      (ch) => ch.name === defaultChannel
    );
    if (!channel) {
      console.error(`Could not find channel ${defaultChannel}.`);
      return;
    }
    const embed = new Discord.MessageEmbed()
      .setColor("#FFD700")
      .setDescription(message)
      .setTimestamp();
    channel.send({ embeds: [embed] });
    message = "";
  }
};

const runBot = (includeNews, includePrices) => {
  setInterval(async () => {
    await sendNotification(includeNews, includePrices);
  }, notificationInterval);
};

client.login(config.BOT_TOKEN);

runBot(includeNews, includePrices);
