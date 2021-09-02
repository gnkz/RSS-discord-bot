import 'dotenv/config';
import { ethers } from 'ethers';
import Discord, { Intents } from 'discord.js';
import { RSS__factory } from './contracts/factories/RSS__factory';
import { RSP__factory } from './contracts/factories/RSP__factory';

const THIS_CHANNEL_ONLY = process.env.TARGET_CHANNEL;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const provider = new ethers.providers.JsonRpcProvider('http://192.168.3.10:8545');
const RSS = RSS__factory.connect('0x020bb206cd689d6981182579da490d5f4ceb4c46', provider);
const RSP = RSP__factory.connect('0xd1cb076f657a38538a5579e3772788e34e83b19c', provider);
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

        return `Angel #${id} is level ${angelLevel}/${maxLevel}`;
    } catch (err) {
        return `I was not able to get the level for Angel #${id}`;
    }
}

async function sacrifices(address: string) {
    try {
        const sacrifices = await RSP.sacrificedRaccoons(address);

        return `The address ${address} has performed ${sacrifices} sacrifices`;
    } catch (err) {
        return `I was not able to get the number of sacrifices for the address ${address}`;
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
        msg.reply(String(response));
        return;
    }

    if (parsedCommand.length === 2 && parsedCommand[0] === '!angellevel') {
        const response = await angelLevel(Number(parsedCommand[1]));
        msg.reply(response.toString());
        return;

    }

    if (parsedCommand.length === 2 && parsedCommand[0] === '!sacrifices') {
        const response = await sacrifices(parsedCommand[1]);
        msg.reply(response.toString());
        return;
    }

    throw new Error('Invalid command');
}

bot.on('ready', () => {
    console.log('Ready!');
});

bot.on('messageCreate', async (msg) => {
    if (msg.channel.id !== THIS_CHANNEL_ONLY) return;
    if (msg.author.bot) return;

    try {
        await runCommand(msg);
    } catch (err: any) {
        console.log(err.message);
    }
});

bot.login(DISCORD_BOT_TOKEN);
