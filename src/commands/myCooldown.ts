import {Command} from "../command";
import {CommandInteraction} from "discord.js";
import {Bot} from "../main";

export class MyCooldownCmd extends Command {
    public name = "my_cooldown";
    public description = "gets your cooldown info";
    public inDev = true;

    constructor() {
        super();
        this.setName(this.name);
        this.setDescription(this.description);
    }

    execute = async (i: CommandInteraction, bot: Bot) => {
        const cooldown = bot.getUserCooldown(i.user.id)

        if (!cooldown) {
            await i.reply({content: "You do not have a cooldown", ephemeral: true});
            return;
        }

       const endingDate = new Date(cooldown.expiresAt);
       
       console.log(endingDate.toLocaleString())

    }
}