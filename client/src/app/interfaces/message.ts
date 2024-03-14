export interface Message {
    text: string;
    sender: string;
    timestamp?: Date | string;
    visible?: boolean;
}
