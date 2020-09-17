import { Component, OnInit, Input } from "@angular/core";
import { StyleVariables } from '../../../../../../core/theme/styleVariables.model';
@Component({
    selector: 'app-follow-section',
    templateUrl: './follow-section.component.html',
    styleUrls: ['../../../../../pages/social-ecommerce/social-ecommerce.component.scss']
})
export class FollowSectionComponent implements OnInit {
    public shareable: any = { description: '', link: '' };
    public view_share_buttons: boolean;

    @Input() style: StyleVariables;


    constructor() {

    }

    ngOnInit() {

    }

    shareLink() {
        this.shareable.link = 'https://yammfood.royoapps.com/';
        this.shareable.description = `You are invited to visit Royo food.`;
        this.view_share_buttons = true;
    }
}