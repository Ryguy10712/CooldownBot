import {EmbedBuilder} from "discord.js";

export class NoCooldown extends EmbedBuilder {
    constructor() {
        super()
        this.setTitle("Play ball!")
        this.setColor("Red");
        this.addFields({name: "Failed:", value: "You do not have a cooldown"});
    }
}

export class CooldownInfo extends EmbedBuilder {
    constructor(expiryMs: number) {
        super()
        this.setTitle("Info")
        this.setColor("Blue");

        //convert ms to a readable string that includes the date and time of expiry, and time zone
        const expiryDate = new Date(expiryMs);
        const month = this.monthToText(expiryDate.getMonth());
        const day = expiryDate.getDate();
        const year = expiryDate.getFullYear();

        const option = {timeZone: "America/New_York"}

        this.addFields(
            {name: "Expires at:", value: `${month} ${day}, ${year} at ${expiryDate.toLocaleTimeString("en-US", option)}`}
        )

        this.setFooter({text: `Listed in EST (UTC-5:00)`})
    }

    private monthToText(month: number): string {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        return months[month];
    }
}