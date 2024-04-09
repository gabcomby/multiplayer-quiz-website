import { Application } from '@app/app';
import { AuthService } from '@app/services/auth.service';
import { Message } from '@common/message';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('AuthController', () => {
    let authService: SinonStubbedInstance<AuthService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        authService = createStubInstance(AuthService);
        const app = Container.get(Application);
        Object.defineProperty(app['authController'], 'authService', { value: authService, writable: true });
        expressApp = app.app;
    });

    // it('should return a success message on valid password', async () => {
    //     const validPassword = 'correct_password';
    //     const expectedMessage: Message = { title: 'Authentication Successful', body: 'Authenticated successfully.' };
    //     authService.authenticate.withArgs(validPassword).returns(expectedMessage);

    //     return supertest(expressApp)
    //         .post('/api/authenticate')
    //         .send({ password: validPassword })
    //         .expect(StatusCodes.OK)
    //         .then((response) => {
    //             chai.expect(response.body).to.deep.equal(expectedMessage);
    //         });
    // });

    it('should return an unauthorized message on invalid password', async () => {
        const invalidPassword = 'wrong_password';
        const expectedMessage: Message = { title: 'Authentication Failed', body: 'Invalid password.' };
        authService.authenticate.withArgs(invalidPassword).returns(expectedMessage);

        return supertest(expressApp)
            .post('/api/authenticate')
            .send({ password: invalidPassword })
            .expect(StatusCodes.UNAUTHORIZED)
            .then((response) => {
                chai.expect(response.body).to.deep.equal(expectedMessage);
            });
    });

    it('should return a bad request message on missing password', async () => {
        return supertest(expressApp)
            .post('/api/authenticate')
            .send({})
            .expect(StatusCodes.BAD_REQUEST)
            .then((response) => {
                chai.expect(response.body.title).to.equal('Invalid Request');
            });
    });
});
