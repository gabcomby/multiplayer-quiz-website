import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticated = new BehaviorSubject<boolean>(false);
    private readonly apiUrl = environment.serverUrl;

    constructor(private http: HttpClient) {}

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
