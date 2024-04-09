import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import type { Player } from '@app/interfaces/match';

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

    ngOnInit() {
        this.dataSource.sort = this.sort;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['playerList']) {
            this.dataSource.data = this.playerList;
        }
    }
}
