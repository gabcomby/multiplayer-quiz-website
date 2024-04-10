import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-modify-question-qbank',
    templateUrl: './modify-question-qbank.component.html',
    styleUrls: ['./modify-question-qbank.component.scss'],
})
export class ModifyQuestionQbankComponent implements OnInit {
    id: string;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') ?? '';
    }
}
