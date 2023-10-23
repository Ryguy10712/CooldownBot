import {SlashCommandBuilder, CommandInteraction} from "discord.js";
import {Bot} from "./main";

export abstract class Command extends SlashCommandBuilder {
    public abstract name: string;
    public abstract description: string;
    public abstract execute: (i: CommandInteraction, bot: Bot) => Promise<void>;
    public inDev: boolean = false;

}