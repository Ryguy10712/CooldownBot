import {Bot} from "./main";

export abstract class eventListener {
    public abstract eventName: string;

    abstract startListener(bot: Bot): void;
}