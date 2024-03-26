import { Document } from 'mongoose';

export interface IPlayer extends Document {
    id: string;
    name: string;
    score: number;
    bonus: number;
}

// export interface IMatch extends Document {
//     id: string;
//     playerList: IPlayer[];
// }

// export const playerSchema: Schema = new Schema({
//     id: { type: String, required: true },
//     name: { type: String, required: true },
//     score: { type: Number, required: true },
//     bonus: { type: Number, required: true },
// });

// const matchSchema: Schema = new Schema({
//     id: { type: String, required: true },
//     playerList: [playerSchema],
// });

// export default mongoose.model<IPlayer>('Player', playerSchema);
