export interface Question {
    type: string;
    text: string;
    points: number;
    choices?: Choice[];
}

interface Choice {
    text: string;
    isCorrect: boolean;
}
