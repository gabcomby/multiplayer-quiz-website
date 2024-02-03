import matchModel from '@app/model/match.model';
import { MatchService } from '@app/services/match.service';
import { SinonSandbox, SinonStub, createSandbox } from 'sinon';

describe('MatchService', () => {
    let matchService: MatchService;
    let sandbox: SinonSandbox;
    let findStub: SinonStub;
    let findOneStub: SinonStub;
    let createStub: SinonStub;
    let findOneAndDeleteStub: SinonStub;
    let findOneAndUpdateStub: SinonStub;

    const matchInstance = new matchModel([
        {
            id: '1a2b3c',
            name: 'Test Match',
            players: [
                {
                    id: 'player1',
                    name: 'Test Player 1',
                },
                {
                    id: 'player2',
                    name: 'Test Player 2',
                },
            ],
        },
        {
            id: '4d5e6f',
            name: 'Test Match 2',
            players: [
                {
                    id: 'player3',
                    name: 'Test Player 3',
                },
                {
                    id: 'player4',
                    name: 'Test Player 4',
                },
            ],
        },
    ]);

    beforeEach(() => {
        sandbox = createSandbox();
        matchService = new MatchService();
        findStub = sandbox.stub(matchModel, 'find');
        findOneStub = sandbox.stub(matchModel, 'findOne');
        createStub = sandbox.stub(matchModel, 'create');
        findOneAndDeleteStub = sandbox.stub(matchModel, 'findOneAndDelete');
        findOneAndUpdateStub = sandbox.stub(matchModel, 'findOneAndUpdate');
    });

    afterEach(() => {
        sandbox.restore();
    });
});
