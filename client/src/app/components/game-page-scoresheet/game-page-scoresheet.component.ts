import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Player, PlayerStatus } from '@app/interfaces/match';
import { SocketService } from '@app/services/socket/socket.service';

const NOT_FOUND_INDEX = -1;
const SORT_BEFORE = -1;
const SORT_AFTER = 1;

@Component({
    selector: 'app-game-page-scoresheet',
    templateUrl: './game-page-scoresheet.component.html',
    styleUrls: ['./game-page-scoresheet.component.scss'],
})
export class GamePageScoresheetComponent implements OnInit, OnChanges {
    @Input() playerList: Player[];
    @Input() playerLeftList: Player[];
    @Input() isHost: boolean;

    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: MatTableDataSource<Player> = new MatTableDataSource();

    constructor(private socketService: SocketService) {}

    ngOnInit() {
        this.dataSource.sort = this.sort;
        this.listenForPlayerStatusChanges();
    }

    listenForPlayerStatusChanges(): void {
        this.socketService.onPlayerStatusChanged(({ playerId, status }) => {
            const playerIndex = this.dataSource.data.findIndex((player) => player.id === playerId);
            if (playerIndex !== NOT_FOUND_INDEX) {
                const updatedPlayers = this.dataSource.data.slice();
                updatedPlayers[playerIndex] = {
                    ...updatedPlayers[playerIndex],
                    status,
                };
                this.dataSource.data = updatedPlayers;
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['playerList']) {
            const transformedPlayerList = this.playerList.map((player) => ({
                ...player,
                chatPermission: player.chatPermission !== undefined ? player.chatPermission : true,
            }));

            transformedPlayerList.sort((a, b) => {
                if (a.score > b.score) return SORT_BEFORE;
                if (a.score < b.score) return SORT_AFTER;

                return a.name.localeCompare(b.name);
            });

            this.dataSource.data = transformedPlayerList;
        }
    }

    toggleChatPermission(player: Player): void {
        const newPermission = !player.chatPermission;
        player.chatPermission = newPermission;
        this.socketService.sendChatPermission(player.id, newPermission);
    }

    getPlayerStatus(status: number): string {
        switch (status) {
            case PlayerStatus.Inactive:
                return 'Inactive';
            case PlayerStatus.Active:
                return 'Active';
            case PlayerStatus.Confirmed:
                return 'Confirmed';
            default:
                return '';
        }
    }

    getStatusClass(player: Player): string {
        switch (player.status) {
            case PlayerStatus.Inactive:
                return 'inactive-player';
            case PlayerStatus.Active:
                return 'active-player';
            case PlayerStatus.Confirmed:
                return 'confirmed-player';
            default:
                return '';
        }
    }
}
