import {eventListener} from "../eventlistener";
import {Bot} from "../main";
import {Interaction} from "discord.js";

export class interactionCreateListener extends eventListener{
    public eventName = "interactionCreate";

    public async startListener(bot: Bot) {
        bot.client.on(this.eventName, async (interaction: Interaction) => {
            if (!interaction.isCommand()) return;

            if(!interaction.guild || interaction.guild.id != "932118788952948756") {
                interaction.reply("This bot is only for use within PCL");
                return;
            }

            const command = bot.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction, bot);
            } catch (error) {

                console.error(error);
            }
        })
    }
}