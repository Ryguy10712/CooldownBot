import {EmbedBuilder} from "discord.js";
import {cooldownOutcome} from "../interfaces";

export class CdSuccessEmbd extends EmbedBuilder {
    constructor(userId: string, reason: string, time: string) {
        super();
        this.setTitle("***PICKUP COOLDOWN***");

        //make time a clean string
        time = time.replace("h", " Hours");
        time = time.replace("d", " Days");
        time = time.replace("w", " Weeks");
        time = time.replace("m", " Months");

        //make first letter of reason captial
        reason = reason.charAt(0).toUpperCase() + reason.slice(1);

        this.setDescription(`<@${userId}> has been given a cooldown.`)

        this.addFields(
            {name: "Reason:", value: reason, inline: true},
            {name: `Duration`, value: `${time}`, inline: true},
        )
        this.setColor("#0f212c");
    }
}

export class CdFailureEmbd extends EmbedBuilder {
    constructor(outcome: cooldownOutcome) {
        super()
        this.setTitle("***COOLDOWN FAILED***")
        this.setColor("Red");
        this.addFields({name: "Reason:", value: cooldownOutcome[outcome]});
    }
}

export class NoPermissionEmbd extends EmbedBuilder {
    constructor() {
        super()
        this.setTitle("Nope...")
        this.setColor("Red");
        this.addFields({name: "Failed:", value: "You do not have permission to use this command."});
    }
}

export class InvalidTimeArgumentEmbd extends EmbedBuilder {
    constructor() {
        super()
        this.setTitle("Try again")
        this.setColor("Red");
        this.addFields({name: "Failed:", value: "The time arguments must contain either h, d, w, or m; and cannot have spaces"});
    }
}

export class RemoveCooldownSuccessEmbd extends EmbedBuilder {
    constructor(userId: string) {
        super()
        this.setTitle("Success")
        this.setColor("Green");
        this.addFields({name: "Success:", value: `<@${userId}>'s cooldown has been removed`});
    }
}