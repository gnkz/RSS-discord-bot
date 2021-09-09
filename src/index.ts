import 'dotenv/config';
import { ethers } from 'ethers';
import Discord, { Intents } from 'discord.js';
import { RSS__factory } from './contracts/factories/RSS__factory';
import { RSP__factory } from './contracts/factories/RSP__factory';

const THIS_CHANNEL_ONLY = process.env.TARGET_CHANNEL;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const JSON_RPC_URL = process.env.JSON_RPC_URL;
const RSS_ADDRESS = '0x020bb206cd689d6981182579da490d5f4ceb4c46';
const RSP_ADDRESS = '0xd1cb076f657a38538a5579e3772788e34e83b19c';

const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_URL);
const RSS = RSS__factory.connect(RSS_ADDRESS, provider);
const RSP = RSP__factory.connect(RSP_ADDRESS, provider);
const bot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

async function isHarbinger(id: number) {
    try {
        const isHarbinger = await RSS.isHarbinger(id);
        if (isHarbinger) {
            return `Raccoon #${id} is a harbinger`;
        }

        return `Raccoon #${id} is NOT a harbinger`;
    } catch (err) {
        return `I was not able to check if raccoon #${id} is a harbinger or not`;
    }
}

async function angelLevel(id: number) {
    try {
        const [angelLevel, maxLevel] = await Promise.all([
            RSP.angelLevels(id),
            RSP.MAX_ANGEL_LVL(),
        ]);

        return `Angel #${id} is level ${angelLevel} out of ${maxLevel}`;
    } catch (err) {
        return `I was not able to get the level for Angel #${id}`;
    }
}

async function sacrifices(address: string) {
    try {
        if (!ethers.utils.isAddress(address)) {
            return `${address} is not a valid ethereum address`;
        }
        const sacrifices = await RSP.sacrificedRaccoons(address);

        return `The address ${address} has performed ${sacrifices} sacrifices`;
    } catch (err) {
        return `I was not able to get the number of sacrifices for the address ${address}`;
    }
}

async function rituals() {
    try {
        const [numberOfAngels, maxNumberOfAngels] = await Promise.all([RSP.totalSupply(), RSP.MAX_TOKENS()]);
        const ratio = numberOfAngels.mul(10000).div(maxNumberOfAngels);
        const percentRatio = (ratio.toNumber() / 100).toFixed(2)

        return `${numberOfAngels.toString()} angels have been summoned out of ${maxNumberOfAngels.toString()} (${percentRatio}%)`
    } catch (err) {
        return 'I was not able to determine the number of rituals that have been performed';
    }
}

async function runCommand(msg: Discord.Message) {
    const { content } = msg;

    if (!content.startsWith('!')) {
        throw new Error('Invalid command');
    }

    const parsedCommand = content.split(' ');

    if (parsedCommand.length === 2 && parsedCommand[0] === '!harbinger') {
        const response = await isHarbinger(Number(parsedCommand[1]));
        msg.reply(response);
        return;
    }

    if (parsedCommand.length === 2 && parsedCommand[0] === '!angellevel') {
        const response = await angelLevel(Number(parsedCommand[1]));
        msg.reply(response);
        return;

    }

    if (parsedCommand.length === 2 && parsedCommand[0] === '!sacrifices') {
        const response = await sacrifices(parsedCommand[1]);
        msg.reply(response);
        return;
    }

    if (parsedCommand.length === 1 && parsedCommand[0] === '!rituals') {
        const response = await rituals();
        msg.reply(response);
        return;
    }

    throw new Error('Invalid command');
}

bot.on('ready', () => {
    console.log('Ready!');
});

bot.on('messageCreate', async (msg) => {
    if (THIS_CHANNEL_ONLY !== undefined && msg.channel.id !== THIS_CHANNEL_ONLY) return;
    if (msg.author.bot) return;

    try {
        await runCommand(msg);
    } catch (err: any) {
        console.log(err.message);
    }
});

bot.login(DISCORD_BOT_TOKEN);
