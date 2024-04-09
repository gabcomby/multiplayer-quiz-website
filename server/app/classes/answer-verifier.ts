import { GameType, Room } from '@app/classes/room';
import { IPlayer } from '@app/model/match.model';
import { Server as SocketIoServer } from 'socket.io';

const FIRST_ANSWER_MULTIPLIER = 1.2;

export class AnswerVerifier {
    private room: Room;
    private io: SocketIoServer;
    private roomId: string;
    private playerHasAnswered = new Map<string, boolean>();
    private nbrOfAssertedAnswers = 0;
    private globalAnswersText: [IPlayer, string][] = [];
    private globalAnswerIndex: number[] = [];
    private firstAnswerForBonus: boolean = true;
    private allAnswersForQCM = new Map<string, number[]>();
    private allAnswersForQRL = new Map<string, [IPlayer, string][]>();
    private allAnswersGameResults = new Map<string, number[]>();
    private counterHalfCorrectAnswerQRL: number = 0;
    private counterIncorrectAnswerQRL: number = 0;
    private counterCorrectAnswerQRL: number = 0;

    constructor(room: Room) {
        this.room = room;
        this.io = room.io;
        this.roomId = room.roomId;
    }

    get allAnswersGameResultsValue(): Map<string, number[]> {
        return this.allAnswersGameResults;
    }

    get allAnswersForQRLValue(): Map<string, [IPlayer, string][]> {
        return this.allAnswersForQRL;
    }

    set firstAnswerForBonusValue(value: boolean) {
        this.firstAnswerForBonus = value;
    }

    set nbrOfAssertedAnswersValue(value: number) {
        this.nbrOfAssertedAnswers = value;
    }

    set playerHasAnsweredSetter(value: Map<string, boolean>) {
        this.playerHasAnswered = value;
    }

    // eslint-disable-next-line complexity
    verifyAnswers(playerId: string, answerIdx: number[] | string, player?: IPlayer): void {
        if (!answerIdx || this.playerHasAnswered.get(playerId)) {
            return;
        }
        this.playerHasAnswered.set(playerId, true);
        const question = this.room.currentQuestion;
        this.nbrOfAssertedAnswers += 1;
        if (typeof answerIdx === 'string') {
            this.globalAnswersText.push([player, answerIdx]);
        }
        if (this.room.gameTypeValue === GameType.TEST && question.type === 'QRL') {
            this.room.playerListValue.get(playerId).score += question.points;
        } else if (typeof answerIdx !== 'string') {
            if (answerIdx.length !== 0) {
                answerIdx.forEach((index) => {
                    this.globalAnswerIndex.push(index);
                });
                const totalCorrectChoices = question.choices.reduce((count, choice) => (choice.isCorrect ? count + 1 : count), 0);
                const isMultipleAnswer = totalCorrectChoices > 1;
                let isCorrect = false;
                if (!isMultipleAnswer) {
                    isCorrect = question.choices[answerIdx[0]].isCorrect;
                } else {
                    for (const index of answerIdx) {
                        if (answerIdx.length < totalCorrectChoices) {
                            isCorrect = false;
                            break;
                        }
                        if (!question.choices[index].isCorrect) {
                            isCorrect = false;
                            break;
                        }
                        isCorrect = true;
                    }
                }
                if (isCorrect && this.firstAnswerForBonus) {
                    this.firstAnswerForBonus = false;
                    this.room.playerListValue.get(playerId).score += question.points * FIRST_ANSWER_MULTIPLIER;
                    this.room.playerListValue.get(playerId).bonus += 1;
                } else if (isCorrect) {
                    this.room.playerListValue.get(playerId).score += question.points;
                }
            }
        }
        if (this.nbrOfAssertedAnswers === this.room.playerList.size) {
            this.io.to(this.roomId).emit('playerlist-change', Array.from(this.room.playerList));
            if (question.type === 'QCM') {
                this.allAnswersForQCM.set(question.text, this.globalAnswerIndex);
                this.allAnswersGameResults.set(question.text, this.globalAnswerIndex);
                this.globalAnswerIndex = [];
            } else if (question.type === 'QRL') {
                this.allAnswersForQRL.set(question.text, this.globalAnswersText);
                this.globalAnswersText = [];
                this.io.to(this.room.hostId).emit('locked-answers-QRL', Array.from(this.allAnswersForQRL));
            }
        }
        // else {
        //     if (question.type === 'QRL') {
        //         this.allAnswersForQRL.set(question.text, this.globalAnswersText);
        //     }
        // }
    }

    calculatePointsQRL(points: [IPlayer, number][]): void {
        const question = this.room.currentQuestion;
        const playerArray = Array.from(this.room.playerListValue.entries());
        if (!points) return;
        points.forEach(([player, point]: [IPlayer, number]) => {
            const playerIndex = playerArray.findIndex(([, p]) => p.id === player.id);
            if (question && playerIndex >= 0) {
                playerArray[playerIndex][1].score += point * question.points;
                if (point === 1) {
                    this.counterCorrectAnswerQRL += 1;
                } else if (point === 0) {
                    this.counterIncorrectAnswerQRL += 1;
                } else {
                    this.counterHalfCorrectAnswerQRL += 1;
                }
            }
        });
        this.allAnswersGameResults.set(question.text, [
            this.counterIncorrectAnswerQRL,
            this.counterHalfCorrectAnswerQRL,
            this.counterCorrectAnswerQRL,
        ]);
        this.counterIncorrectAnswerQRL = 0;
        this.counterCorrectAnswerQRL = 0;
        this.counterHalfCorrectAnswerQRL = 0;
        this.io.to(this.roomId).emit('playerlist-change', playerArray);
    }
}
