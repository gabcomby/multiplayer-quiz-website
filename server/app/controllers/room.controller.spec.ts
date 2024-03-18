import { Application } from '@app/app';
import { RoomAuthService } from '@app/services/room-auth.service';
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('RoomController', () => {
    let roomAuthService: SinonStubbedInstance<RoomAuthService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        roomAuthService = createStubInstance(RoomAuthService);

        const app = Container.get(Application);
        Object.defineProperty(app['roomController'], 'roomAuthService', { value: roomAuthService, writable: true });

        expressApp = app.app;
    });

    it('should return room lock status on POST request', async () => {
        const mockRoomId = '123';
        const mockBody = { playerId: 'abc' };
        const mockResponse = false;
        roomAuthService.verifyPlayerCanJoinRoom.resolves(mockResponse);

        const response = await supertest(expressApp).post(`/api/rooms/${mockRoomId}/auth`).send(mockBody).expect(StatusCodes.OK);

        chai.expect(response.body).to.deep.equal(mockResponse);
    });

    it('should return an error status on POST request if service fails', async () => {
        const mockRoomId = '123';
        const mockBody = { playerId: 'abc' };
        roomAuthService.verifyPlayerCanJoinRoom.rejects(new Error('Service Failure'));

        return supertest(expressApp)
            .post(`/api/rooms/${mockRoomId}/auth`)
            .send(mockBody)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
                chai.expect(response.body).to.deep.equal({ error: 'Error fetching room lock status' });
            });
    });
});
