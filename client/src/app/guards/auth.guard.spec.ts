import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@app/services/auth.service';
import { authGuard } from './auth.guard';

describe('AuthGuard (isolated)', () => {
    let authServiceStub: Partial<AuthService>;
    let stateMock: Partial<RouterStateSnapshot>;
    let routeMock: Partial<ActivatedRouteSnapshot>;

    beforeEach(() => {
        authServiceStub = { checkAuthentication: () => true };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [{ provide: AuthService, useValue: authServiceStub }],
        });
    });

    it('grants access when the user is logged in', async () => {
        const result = await TestBed.runInInjectionContext(async () =>
            authGuard(routeMock as ActivatedRouteSnapshot, stateMock as RouterStateSnapshot),
        );
        expect(result).toBeTrue();
    });

    it('denies access when the user is not logged in', async () => {
        authServiceStub.checkAuthentication = () => false;

        const result = await TestBed.runInInjectionContext(async () =>
            authGuard(routeMock as ActivatedRouteSnapshot, stateMock as RouterStateSnapshot),
        );
        expect(result).toBeFalse();
    });
});
