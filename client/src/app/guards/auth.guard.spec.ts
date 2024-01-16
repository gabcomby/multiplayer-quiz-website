import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { AUTH_GUARD } from './auth.guard';

describe('authGuard', () => {
    const executeGuard: CanActivateFn = AUTH_GUARD;

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        expect(executeGuard).toBeTruthy();
    });
});
