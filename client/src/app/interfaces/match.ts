export interface Match {
    id: string;
    playerList: Player[];
}

export enum PlayerStatus {
    Inactive,
    Active,
    Confirmed,
}

export interface Player {
    id: string;
    name: string;
    score: number;
    bonus: number;
    chatPermission?: boolean;
    status?: PlayerStatus;
}
