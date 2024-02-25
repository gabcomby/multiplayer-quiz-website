import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

const NINE_THOUSAND = 9000;
const ONE_THOUSAND = 1000;

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent implements OnInit {
    matchCode: string;
    playerName: string;
    private gameId: string;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}
    ngOnInit() {
        this.gameId = this.route.snapshot.params['gameId'];
        this.playerName = this.route.snapshot.params['userName'];
        this.matchCode = Math.floor(Math.random() * NINE_THOUSAND + ONE_THOUSAND).toString();
    }

    handleGameLaunch() {
        this.router.navigate(['/game', this.gameId]);
    }
}
