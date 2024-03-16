import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { Player } from '@app/interfaces/match';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    apiUrl: string;
    constructor(
        @Inject(API_BASE_URL) baseUrl: string,
        private http: HttpClient,
    ) {
        this.apiUrl = `${baseUrl}/rooms`;
    }

    verifyPlayerCanJoin(gameId: string, player: Player): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/${gameId}/auth`, player);
    }
}
