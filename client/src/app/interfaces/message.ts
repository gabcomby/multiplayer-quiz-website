export interface Message {
    text: string;
    sender: string;
    timestamp?: Date | string;
    visible?: boolean;
}

export interface ChatMessageCommand {
    text: string;
    playerName: string;
    roomId: string;
    isHost: boolean;
}
