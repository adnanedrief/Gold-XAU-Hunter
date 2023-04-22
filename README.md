# Gold-XAU Hunter
The Discord bot fetches real-time data on gold prices and news related to gold from reliable sources, allowing users to stay informed about the latest trends without manually searching for information. This provides users with up-to-date and accurate information, which can help them make more informed investment decisions. The bot's real-time updates are faster and more accurate than traditional sources, making it a valuable tool for anyone interested in the gold market.

# Requirements
- Node.js v16
- Discord.js v13

# Installation & Configuration
1. Clone this repository to your local machine using: 
`git clone https://github.com/adnanedrief/Gold-XAU-Hunter.git`
2. Install the required dependencies using :
`npm install nodemon axios discord.js@13.15.1`
3. Create a new application and bot on **Discord Developer Portal**
4. Copy the bot token and add it to your  **config.json file**  as **BOT_TOKEN**
5. Obtain a News API key from https://newsapi.org and add it to  **config.json file**  as **NEWS_API_KEY**
6. Obtain a Gold API key from https://www.goldapi.io and add it to **config.json file**  as  **GOLD_API_KEY**

# Usage  
Start the bot using 
`nodemon index.js`


# Features

The bot supports the following commands:
- **!help**: Get a list of available commands.
- **!setchannel < channel_name >**: Set the channel where notifications will be sent.
- **!setthreshold < percentage >**: Set the percentage threshold for price change notifications.
- **!setnotificationtime < minute >**: Set the time when notifications will be sent.
- **!goldpricesonly**: Receive notifications for gold prices only.
- **!goldnewsonly**: Receive notifications for news about gold only.
- **!both**: Receive notifications for both gold prices and news.
- **!getgoldpricenow**: Get the current gold price.
- **!getgoldnewsnow**: Get the latest news about gold.

# Changing Default Values
The bot has several default values that can be changed:
- **threshold** : The percentage threshold for price change notifications. The default value is 0.0001 (0.01%).
- **defaultChannel** : The default channel where notifications will be sent. The default value is "general".
- **notificationInterval** : The time interval when notifications will be sent. The default value is 60000 milliseconds (1 minute).
- **prefix** : The command prefix. The default value is "!".
- **includeNews** : Whether to include news notifications. The default value is false.
- **includePrices** : Whether to include price change notifications. The default value is false.

# Demo 
![1](https://user-images.githubusercontent.com/76531566/233754761-f1a94857-80de-44e9-b5f2-8919b1e30420.png)
![3](https://user-images.githubusercontent.com/76531566/233754764-fe5950d6-a888-4a41-acd7-18621dec3bc8.png)


# Contributing
Contributions are welcome! If you have any ideas, feel free to open an issue or a pull request.
