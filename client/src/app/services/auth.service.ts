import { Injectable } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticated = new BehaviorSubject<boolean>(false);

    constructor(private apiService: ApiService) {}

    get isAuthenticated$(): Observable<boolean> {
        return this.isAuthenticated.asObservable();
    }

    authenticate(password: string): Observable<boolean> {
        return this.apiService.authenticate(password).pipe(tap((isLoggedIn) => this.isAuthenticated.next(isLoggedIn)));
    }

    checkAuthentication(): boolean {
        return this.isAuthenticated.value;
    }
}
