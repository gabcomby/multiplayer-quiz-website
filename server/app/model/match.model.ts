import { Document } from 'mongoose';

export enum PlayerStatus {
    Inactive,
    Active,
    Confirmed,
}

export interface IPlayer extends Document {
    id: string;
    name: string;
    score: number;
    bonus: number;
    chatPermission?: boolean;
    status?: PlayerStatus;
}
