# Raccoon Secret Society Discord Bot

## Available commands

- `!harbinger #id`: Checks if the raccoon with `#id` is a harbinger
- `!angellevel #id`: Checks the level of the angel with `#id`
- `!sacrifices #address`: Checks how many sacrifices the `#address` user has made

## Configuration

Create a `.env` file in the root directory
```
DISCORD_BOT_TOKEN=
TARGET_CHANNEL=
JSON_RPC_URL=
```

- `DISCORD_BOT_TOKEN`: Can be obtained following [these instructions](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- `TARGET_CHANNEL`: If you want the bot to react to messages from an specific channel
- `JSON_RPC_URL`: An infura endpoint like `https://mainnet.infura.io/v3/<project id>`

## Running the bot

### Using node

First build with `npm run build` and then run with `npm run start`

### Using docker-compose

Just run `docker-compose url`
