import {EmbedBuilder} from "discord.js";
import {cooldownOutcome} from "../interfaces";

export class CdSuccessEmbd extends EmbedBuilder {
    constructor(userId: string, reason: string, time: string) {
        super();
        this.setTitle("***COOLDOWN***");

        //make time a clean string
        time = time.replace("h", " hours");
        time = time.replace("d", " days");
        time = time.replace("w", " weeks");
        time = time.replace("m", " months");

        this.addFields(
            {name: `<@${userId}> has been cooled down for`, value: `${reason}`},
            {name: "Duration:", value: time}
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