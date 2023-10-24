export interface cooldownInfo {
    userId: string,
    reason: string,
    issuedAt: number,
    expiresAt: number,
    "guildId": string
}

export enum cooldownOutcome {
    SUCCESS,
    USER_NOT_FOUND,
    ADD_ROLE_FAILED,
    FAILED_TO_WRITE
}