import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Player } from '@app/interfaces/match';
import { SocketService } from '@app/services/socket/socket.service';

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
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['playerList']) {
            this.dataSource.data = this.playerList.map((player) => ({
                ...player,
                chatPermission: player.chatPermission !== undefined ? player.chatPermission : true,
            }));
        }
    }

    toggleChatPermission(player: Player): void {
        const newPermission = !player.chatPermission;
        player.chatPermission = newPermission;
        this.socketService.sendChatPermission(player.id, newPermission);
    }
}
