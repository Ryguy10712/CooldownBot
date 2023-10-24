import {Command} from "../command";
import {CommandInteraction, Guild, GuildMember} from "discord.js";
import {cooldownInfo, cooldownOutcome} from "../interfaces";
import {Bot} from "../main";
import {CooldownReasonModal} from "../components/CooldownReasonModal";
import {CdFailureEmbd, CdSuccessEmbd, InvalidTimeArgumentEmbd, NoPermissionEmbd} from "../components/CooldownResponses";

export class CooldownCmd extends Command {
    public name = "cooldown";
    public description = "cool down a specified user, or update an existing cooldown";
    public inDev = true;

    constructor() {
        super();
        this.setName(this.name);
        this.setDescription(this.description);

        //create user, time, and reason options
        this.addUserOption(option => {
            option.setName("user");
            option.setDescription("The user to cool down");
            option.setRequired(true);
            return option;
        })

        this.addStringOption(option => {
            option.setName("time");
            option.setDescription("h for hours, d for days, w for weeks, m for months");
            option.setRequired(true);
            return option;
        })

        this.addStringOption(option => {
            option.setName("reason");
            option.setDescription("The reason for the cooldown");
            option.setRequired(true);


            option.addChoices({name: "Late", value: "late"}, {name: "Uncompetitive", value: "uncompetitive"},
                {name: "No-show", value: "no-show"}, {name: "Left Early", value: "left-early"}, {name: "Other", value: "other"}
            )

            return option;
        })
    }

    public execute = async (i: CommandInteraction, bot: Bot) => {
        const user = i.options.getUser("user", true);
        const time = i.options.get("time", true).value as string
        const reason = i.options.get("reason", true);

        //make sure user did not try to cooldown bot5
        if(user.bot){
            i.reply(`This idiot <@${i.user.id}> just tried to cooldown a bot 🤣🤣🤣`).then();
            return;
        }
        
        //make sure the user has admin roles
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

        //make sure time has no spaces
        if (time.includes(" ")) {
            i.reply({embeds: [new InvalidTimeArgumentEmbd()], ephemeral: true}).then();
            return;
        }

        //make sure the time ends with a valid suffix
        if (!time.endsWith("h") && !time.endsWith("d") && !time.endsWith("w") && !time.endsWith("m")) {
            i.reply({embeds: [new InvalidTimeArgumentEmbd()], ephemeral: true}).then();
            return;
        }
        

        //get the time in milliseconds
        const issuedTimeMs = Date.now();
        let durationMs = issuedTimeMs;
        if (time.endsWith("h")) {
            durationMs += parseInt(time.slice(0, -1)) * 3600000;
        }
        else if (time.endsWith("d")) {
            durationMs += parseInt(time.slice(0, -1)) * 86400000;
        }
        else if (time.endsWith("w")) {
            durationMs += parseInt(time.slice(0, -1)) * 604800000;
        }
        else if (time.endsWith("m")) {
            durationMs += parseInt(time.slice(0, -1)) * 2628000000;
        }

        //if the reason is other, present a modal to the issuer to get the reason, and make a custom cooldown info
        if (reason.value === "other") {
            const modal = new CooldownReasonModal();
            await i.showModal(modal)
            const modalInteraction = await i.awaitModalSubmit({time: 5000})

            if (modalInteraction) {
                const reason = modalInteraction.fields.getTextInputValue("reasonText")
                const cooldownInfo: cooldownInfo = {
                    reason: reason,
                    userId: user.id,
                    issuedAt: issuedTimeMs,
                    expiresAt: durationMs,
                    guildId: i.guild!.id,
                }

                //add the cooldown
                const outcome = await bot.addCooldown(cooldownInfo, i.guild!.id);
                if(cooldownOutcome.SUCCESS == outcome){
                    modalInteraction.reply({content: `<@${user.id}>`, embeds: [new CdSuccessEmbd(user.id, reason, time)]}).then();
                }
                else {
                    modalInteraction.reply({embeds: [new CdFailureEmbd(outcome)], ephemeral: true}).then();
                }
                return;
                //end of modal workflow
            }
        }

        //start of given reason workflow
        //create the cooldown info
        const cooldownInfo: cooldownInfo = {
            reason: reason.value as string,
            userId: user.id,
            issuedAt: issuedTimeMs,
            expiresAt: durationMs,
            guildId: i.guild!.id,
        }

        //add the cooldown
        bot.addCooldown(cooldownInfo, i.guild!.id).then((outcome) => {
            if (outcome == cooldownOutcome.SUCCESS) {
                i.reply({content: `<@${user.id}>`, embeds: [new CdSuccessEmbd(user.id, (reason.value as string), time)]}).then();
            }
            else {
                i.reply(
                    {embeds: [new CdFailureEmbd(outcome)], ephemeral: true}
                ).then();
            }
        })



    }
}