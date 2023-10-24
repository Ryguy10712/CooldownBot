import {Command} from "../command";
import {Bot} from "../main";
import {CommandInteraction} from "discord.js";
import {cooldownOutcome} from "../interfaces";

export class RemoveCooldownCmd extends Command{
    public name = "remove_cooldown";
    public description = "Removes a cooldown from a user";
    public inDev = true;

    constructor() {
        super();
        this.setName(this.name);
        this.setDescription(this.description);

        this.addUserOption(option => {
            option.setName("user");
            option.setDescription("The user to remove the cooldown from");
            option.setRequired(true);
            return option;
        })
    }

    execute = async (i: CommandInteraction, bot: Bot) => {
        const user = i.options.getUser("user", true);

        const cooldown = bot.getUserCooldown(user.id)

        if (!cooldown) {
            await i.reply({content: "This user does not have a cooldown", ephemeral: true});
            return;
        }

        const outcome: cooldownOutcome = await bot.removeCooldown(user.id, i.guild!.id);

        if(outcome != cooldownOutcome.SUCCESS){
            await i.reply({content: "There was an error removing the cooldown", ephemeral: true});
            return;
        }

        await i.reply({content: "The cooldown has been removed", ephemeral: true});
    }
}