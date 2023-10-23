import {Command} from "../command";
import {CommandInteraction} from "discord.js";
import {cooldownInfo} from "../interfaces";
import {Bot} from "../main";
import {CooldownReasonModal} from "../components/CooldownReasonModal";

export class CooldownCmd extends Command {
    public name = "cooldown";
    public description = "cool down a specified user";
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

        //make sure the time ends with a valid suffix
        if (!time.endsWith("h") && !time.endsWith("d") && !time.endsWith("w") && !time.endsWith("m")) {
            i.reply("Invalid time argument. Must end with h, d, w, or m").then();
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
                }

                //add the cooldown
                const success = await bot.addCooldown(cooldownInfo, i.guild!.id);
                if(success){
                    modalInteraction.reply(`Successfully added cooldown for ${user.username}#${user.discriminator} for ${time} for reason ${reason}`).then();
                }
                else {
                    modalInteraction.reply("Failed to add cooldown").then();
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
        }

        //add the cooldown
        bot.addCooldown(cooldownInfo, i.guild!.id).then((success) => {
            if (success) {
                i.reply(`Successfully added cooldown for ${user.username}#${user.discriminator} for ${time} for reason ${reason.value}`).then();
            }
            else {
                i.reply("Failed to add cooldown").then();
            }
        })



    }
}