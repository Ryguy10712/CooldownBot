import {TextInputStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder} from "discord.js";

export class CooldownReasonModal extends ModalBuilder{
    constructor() {
        super();
        //create text input
        const textInput = new TextInputBuilder()
            .setLabel("Reason")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setCustomId("reasonText")
            .setMaxLength(50);

        const actionRow = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(textInput)

        this.addComponents(actionRow)
        this.setTitle("Cooldown Reason");
        this.setCustomId("reasonModal")

    }
}