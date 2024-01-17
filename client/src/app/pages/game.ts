export interface Game {
    name: string;
    timePerQuestions: number;
    description: string;
    visibility: boolean;
    selected: boolean;
}
export const games: Game[] = [
    {
        name: 'Fortnite',
        timePerQuestions: 10,
        description: 'Its a game of war',
        visibility: true,
        selected: false,
    },
    {
        name: 'Sims5',
        timePerQuestions: 30,
        description: 'Its a life',
        visibility: true,
        selected: false,
    },
    {
        name: 'Call of Duty',
        timePerQuestions: 50,
        description: 'Its a game war',
        visibility: true,
        selected: false,
    },
];
