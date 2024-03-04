import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/app.module';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticated = new BehaviorSubject<boolean>(false);
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string,
    ) {
        this.apiUrl = `${apiBaseURL}`;
    }

    get isAuthenticated$(): Observable<boolean> {
        return this.isAuthenticated.asObservable();
    }

    authenticate(password: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/authenticate`, { password }).pipe(tap((isLoggedIn) => this.isAuthenticated.next(isLoggedIn)));
    }

    checkAuthentication(): boolean {
        return this.isAuthenticated.value;
    }
}
