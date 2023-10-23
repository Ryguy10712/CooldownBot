import {Client, ClientOptions, REST, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationGuildCommandsJSONBody} from "discord.js";

import * as dotenv from "dotenv"
import {Command} from "./command";
import {eventListener} from "./eventlistener";
import {interactionCreateListener} from "./listeners/interactionCreate";
import {CooldownCmd} from "./commands/cooldown";
import {cooldownInfo} from "./interfaces";
import * as fs from "fs/promises"
import {RemoveCooldownCmd} from "./commands/removeCooldown";

dotenv.config();



export class Bot {
    public readonly client: Client;
    public readonly commands: Map<string, Command>
    public readonly listeners: Map<string, eventListener>
    protected cooldowns: {[key: string]: cooldownInfo}
    private cooldownCheckInterval: NodeJS.Timeout | undefined

    constructor() {
        if(!process.env.TOKEN || !process.env.COOLDOWN_ROLE_ID){
            console.error("Missing environment variables! TOKEN and COOLDOWN_ROLE_ID are required. Please check your .env file.")
            process.exit(1)
        }

        this.cooldowns = {};

        const clientParams: ClientOptions = {intents: ["GuildMembers"]}
        this.client = new Client(clientParams);

        this.commands = new Map<string, Command>();
        this.addCommand(new CooldownCmd())
        this.addCommand(new RemoveCooldownCmd())

        this.listeners = new Map<string, eventListener>();
        this.addListener(new interactionCreateListener);
    }

    private addCommand(command: Command){
        this.commands.set(command.name, command);
    }

    private addListener(listener: eventListener){
        this.listeners.set(listener.eventName, listener);
        listener.startListener(this);
    }

    private async deployCommands() {
        const rest = new REST().setToken(process.env.TOKEN!);
        const auth = {"Authorization": `Bot ${process.env.TOKEN}`}
        const cmdBody: RESTPostAPIApplicationCommandsJSONBody[] = []
        const inDevBody: RESTPostAPIApplicationGuildCommandsJSONBody[] = [] //not globalized for faster deployment

        //sort commands into global and dev
        for (const cmd of this.commands.values()) {
            if (!cmd.inDev) {
                cmdBody.push(cmd.toJSON())
            } else {
                inDevBody.push(cmd.toJSON())
            }
        }

        //deploy global commands
        if(cmdBody.length){
            try {
                await rest.put(
                    `/applications/${process.env.CLIENT_ID}/commands`,
                    {body: cmdBody, headers: auth}
                )
                console.log("Successfully registered global commands.")
            }
            catch (error) {
                console.error(error)
            }
        }
        else
            console.log("No global commands to deploy.")

        if(inDevBody.length && process.env.DEV_GUILD_ID){
            //deploy dev commands
            try {
                await rest.put(
                    `/applications/${this.client.application!.id}/guilds/${process.env.DEV_GUILD_ID}/commands`,
                    {body: inDevBody, headers: auth}
                )
                console.log("Successfully registered dev commands.")
            }
            catch (error) {
                console.error(error)
            }
        }
        else
            console.log("No dev commands to deploy.")

    }

    private async initCooldowns() {
        const data = await fs.readFile("./db/cooldowns.json", "utf-8");
        this.cooldowns = JSON.parse(data) as {[key: string]: cooldownInfo};
    }

    public getCooldowns(): {[key: string]: cooldownInfo} {
        return this.cooldowns
    }

    public getUserCooldown(userId: string): cooldownInfo | undefined {
        return this.cooldowns[userId];
    }

    public async addCooldown(cooldown: cooldownInfo, guildId: string): Promise<boolean> {
        try {
            await fs.writeFile("./db/cooldowns.json", JSON.stringify(this.cooldowns));
        } catch (e) {
            return false;
        }
        this.cooldowns[cooldown.userId] = cooldown;
        const guild = await this.client.guilds.fetch(guildId)
        const user = await guild.members.fetch(cooldown.userId);

        if(user){
            try {
                const role = await guild.roles.fetch(process.env.COOLDOWN_ROLE_ID!);
                if (role) {
                    await user.roles.add(role);
                    return true;
                } else {
                    return false;
                }
            }
            catch (e) {
                return false;
            }
        }
        else {
            return false;
        }
    }

    public async removeCooldown(userId: string): Promise<boolean> {
        delete this.cooldowns[userId];
        try {
            await fs.writeFile("./db/cooldowns.json", JSON.stringify(this.cooldowns));
        } catch (e) {
            return false;
        }
        return true;
    }

    public async updateCooldown(cooldown: cooldownInfo): Promise<boolean> {
        this.cooldowns[cooldown.userId] = cooldown;
        try {
            await fs.writeFile("./db/cooldowns.json", JSON.stringify(this.cooldowns));
        } catch (e) {
            return false;
        }
        return true;
    }

    public startCooldownCheckInterval(){
        this.cooldownCheckInterval = setInterval(() => {
            const now = Date.now();
            for(const cooldown of Object.values(this.cooldowns)){
                if(cooldown.expiresAt < now){
                    this.removeCooldown(cooldown.userId).then();
                }
            }
        }, 60000)
    }



    public async start() {
        await this.client.login(process.env.TOKEN);
        console.log(`Logged in as ${this.client.user?.username}!`)
        await this.deployCommands();
        console.log("Commands deployed!");
        await this.initCooldowns()
        console.log("Cooldowns Initialized!")
        this.startCooldownCheckInterval();
        console.log("Cooldown Check Interval Started!")

        console.log("Cooldown Bot is ready!");
    }

}

const bot = new Bot();
bot.start()
    .then();

