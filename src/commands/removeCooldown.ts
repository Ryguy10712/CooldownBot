import {Command} from "../command";
import {Bot} from "../main";
import {CommandInteraction} from "discord.js";
import {cooldownOutcome} from "../interfaces";
import {NoCooldownEmbd, NoPermissionEmbd, RemoveCooldownSuccessEmbd} from "../components/CooldownResponses";

export class RemoveCooldownCmd extends Command{
    public name = "remove_cooldown";
    public description = "Removes a cooldown from a user";
    public inDev = false;

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

        //make sure only an admin can run this
        let roles;
        try {
            await i.guild?.roles.fetch(process.env.COOLDOWN_ROLE_ID!);
            const member = await i.guild!.members.fetch(user.id);
            roles = member.roles.cache
        } catch (error) {
            i.reply({"content": "An unexpected error occured", ephemeral: true})
        }

        const isAdmin = roles?.some(role => {
            return bot.adminIds.includes(role.id);
        })

        if(!roles || !isAdmin){
            i.reply({embeds: [new NoPermissionEmbd()], ephemeral: true}).then();
            return;
        }

        const cooldown = bot.getUserCooldown(user.id)

        if (!cooldown) {
            await i.reply({embeds: [new NoCooldownEmbd()], ephemeral: true});
            return;
        }

        const outcome: cooldownOutcome = await bot.removeCooldown(user.id, i.guild!.id);

        if(outcome != cooldownOutcome.SUCCESS){
            await i.reply({content: `Unexpected Error: ${cooldownOutcome[outcome]}. There's a chance this command may have unknowingly worked anyway`, ephemeral: true});
            return;
        }

        await i.reply({embeds: [new RemoveCooldownSuccessEmbd(user.id)], ephemeral: true});
    }
}