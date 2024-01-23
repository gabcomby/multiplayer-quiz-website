import { AuthService } from '@app/services/auth.service';
import { Message } from '@common/message';
import { expect } from 'chai';
import { Container } from 'typedi';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = Container.get(AuthService);
    });

    it('should return a success message for correct password', () => {
        const correctPassword = 'log2990-102';
        const expectedMessage: Message = {
            title: 'Authentication Successful',
            body: 'Access granted',
        };

        const result = authService.authenticate(correctPassword);
        expect(result).to.deep.equal(expectedMessage);
    });

    it('should return a failure message for incorrect password', () => {
        const incorrectPassword = 'wrong_password';
        const expectedMessage: Message = {
            title: 'Authentication Failed',
            body: 'Invalid password',
        };

        const result = authService.authenticate(incorrectPassword);
        expect(result).to.deep.equal(expectedMessage);
    });

    it('should return a failure message for empty password', () => {
        const emptyPassword = '';
        const expectedMessage: Message = {
            title: 'Authentication Failed',
            body: 'Password is required',
        };

        const result = authService.authenticate(emptyPassword);
        expect(result).to.deep.equal(expectedMessage);
    });
});
