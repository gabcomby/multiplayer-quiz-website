import mongoose, { Document, Schema } from 'mongoose';

export interface IChoice extends Document {
    text: string;
    isCorrect?: boolean;
}

export interface AnswersPlayer extends Map<string, number[]> {}

export interface IQuestion extends Document {
    type: string;
    text: string;
    points: number;
    choices?: IChoice[];
    lastModification: Date;
    id: string;
}

const choiceSchema: Schema = new Schema({
    text: { type: String, required: true },
    isCorrect: Boolean,
});

const questionSchema: Schema = new Schema({
    type: { type: String, required: true },
    text: { type: String, required: true },
    points: { type: Number, required: true },
    choices: [choiceSchema],
    lastModification: { type: Date, required: true },
    id: { type: String, required: true },
});

export default mongoose.model<IQuestion>('Question', questionSchema);
// export mongoose.model<IChoice>('Choice', choiceSchema);
