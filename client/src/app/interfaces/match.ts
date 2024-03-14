export interface Match {
    id: string;
    playerList: Player[];
}

export interface Player {
    id: string;
    name: string;
    score: number;
    bonus: number;
}
