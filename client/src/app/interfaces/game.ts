export enum QuestionType {
    QCM = 'QCM',
    QRL = 'QRL',
}
export interface Game {
    id: string;
    title: string;
    description: string;
    isVisible: boolean;
    duration: number;
    lastModification: Date;
    questions: Question[];
}

export interface Choice {
    text: string;
    isCorrect: boolean;
}

export interface GamePlayed {
    id: string;
    title: string;
    creationDate: Date;
    numberPlayers: number;
    bestScore: number;
}

export interface AnswersPlayer extends Map<string, number[]> {}

export interface Question {
    type: QuestionType;
    text: string;
    points: number;
    choices?: Choice[];
    lastModification: Date;
    id: string;
}
