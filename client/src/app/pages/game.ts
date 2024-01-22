export interface Game {
    id: string;
    name: string;
    timePerQuestions: number;
    description: string;
    visibility: boolean;
}
export const games: Game[] = [
    {
        id: '1',
        name: 'Fortnite',
        timePerQuestions: 10,
        description: 'Its a game of war',
        visibility: true,
    },
    {
        id: '2',
        name: 'Sims5',
        timePerQuestions: 30,
        description: 'Its a life',
        visibility: true,
    },
    {
        id: '3',
        name: 'Call of Duty',
        timePerQuestions: 50,
        description: 'Its a game war',
        visibility: true,
    },
];
