import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private authUrl = 'http://localhost:3000/api/authenticate';

    constructor(private http: HttpClient) {}

    authenticate(password: string): Observable<boolean> {
        return this.http.post<boolean>(this.authUrl, { password });
    }
}
