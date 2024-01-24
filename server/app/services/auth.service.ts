import { Message } from '@common/message';
import { Service } from 'typedi';

@Service()
export class AuthService {
    private readonly adminPassword: string = 'log2990-102';

    authenticate(password: string): Message {
        if (!password) {
            return {
                title: 'Authentication Failed',
                body: 'Password is required',
            };
        }

        if (password === this.adminPassword) {
            return {
                title: 'Authentication Successful',
                body: 'Access granted',
            };
        } else {
            return {
                title: 'Authentication Failed',
                body: 'Invalid password',
            };
        }
    }
}
