import mongoose, { Document, Schema } from 'mongoose';

interface IPlayer extends Document {
    name: string;
    score: number;
}

export interface IMatch extends Document {
    id: string;
    playerList: IPlayer[];
}

const playerSchema: Schema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    score: { type: Number, required: true },
});

const matchSchema: Schema = new Schema({
    playerList: [playerSchema],
});

export default mongoose.model<IMatch>('Match', matchSchema);
