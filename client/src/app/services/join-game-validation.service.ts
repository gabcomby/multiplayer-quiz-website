import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { BehaviorSubject } from 'rxjs';
import { MatchLobbyService } from './match-lobby.service';
import { getLocaleNumberSymbol } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class JoinGameValidationService {
    private isAuthenticated = new BehaviorSubject<boolean>(false);
    private apiUrl: string;
    private bannedNames: string[];
    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string,
        private matchLobbyService: MatchLobbyService,
    ) {
        this.apiUrl = `${apiBaseURL}`;
    }
    checkIfHost(): boolean {
        return this.isAuthenticated.value;
    }
    getBannedNames(lobby: string): string[] {
        this.matchLobbyService.getBannedArray(lobby).subscribe((names) => {
            names.forEach((element) => {
                this.bannedNames.push(element);
            });
        });
        return this.bannedNames;
    }
    isBanned(name: string, lobby: string) {
        this.getBannedNames(lobby);
        this.bannedNames.forEach((elem) => {
            if (elem === name) {
                return true;
            } else {
                return false;
            }
        });
    }
}
