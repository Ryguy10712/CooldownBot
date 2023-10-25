import {Command} from "../command";
import {CommandInteraction} from "discord.js";
import {Bot} from "../main";
import {CooldownInfo, NoCooldown} from "../components/MyCooldownResponses";

export class MyCooldownCmd extends Command {
    public name = "my_cooldown";
    public description = "gets your cooldown info";
    public inDev = false;

    constructor() {
        super();
        this.setName(this.name);
        this.setDescription(this.description);
    }

    execute = async (i: CommandInteraction, bot: Bot) => {
        const cooldown = bot.getUserCooldown(i.user.id)

        if (!cooldown) {
            await i.reply({embeds: [new NoCooldown()], ephemeral: false});
            return;
        }
       
       i.reply({embeds: [new CooldownInfo(cooldown.expiresAt)]});


    }
}