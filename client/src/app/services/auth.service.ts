import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { environment } from '@env/environment.prod';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticated = new BehaviorSubject<boolean>(false);
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        @Inject(API_BASE_URL) apiBaseURL: string = environment.serverUrl,
    ) {
        this.apiUrl = `${apiBaseURL}/api`;
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
