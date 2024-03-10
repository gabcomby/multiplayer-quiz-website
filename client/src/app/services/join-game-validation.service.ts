import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { BehaviorSubject } from 'rxjs';
import { MatchLobbyService } from './match-lobby.service';

@Injectable({ providedIn: 'root' })
export class JoinGameValidationService {
    private isAuthenticated = new BehaviorSubject<boolean>(false);
    private bannedNames: string[];
    private name: string;
    private lobby: string;
    constructor(
        @Inject(API_BASE_URL) apiBaseURL: string,
        private matchLobbyService: MatchLobbyService,
    ) {
        this.bannedNames = [];
    }
    checkIfHost(): boolean {
        return this.isAuthenticated.value;
    }
    getBannedNames(): string[] {
        this.matchLobbyService.getBannedArray(this.lobby).subscribe((names) => {
            names.forEach((element) => {
                this.bannedNames.push(element);
            });
        });
        return this.bannedNames;
    }
    isBanned(): boolean {
        const bannedNames = this.getBannedNames();
        for (const name of bannedNames) {
            if (name === this.name) {
                return true;
            }
        }

        return false;
    }
    async receiveNameAndLobby(namePlayer: string, lobbyNum: string) {
        this.name = namePlayer;
        this.lobby = lobbyNum;
    }

    getLobby(): string {
        return this.lobby;
    }
}
