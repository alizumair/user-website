import { AppSettings } from './../../shared/models/appSettings.model';
import { LoaderState } from './../loader';
import { StyleVariables } from './../theme/styleVariables.model';
import { UtilityService } from './../../services/utility/utility.service';
import { LoaderService } from './../../services/loader/loader.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalVariable } from '../global';

@Component({
	selector: 'app-loader',
	templateUrl: 'loader.component.html',
	styleUrls: ['loader.component.scss']
})

export class LoaderComponent implements OnInit, OnDestroy {
	show: boolean = false;
	refresh: boolean = false;
	loaderColor: string = '';
	styleSubscription: Subscription
	private subscription: Subscription;
	settingsSubscription: Subscription;
	settings: AppSettings;
	style: StyleVariables;
	loader_image: string = '';

	constructor(
		private loaderService: LoaderService,
		private util: UtilityService) {

		this.styleSubscription = this.util.getStyles
			.subscribe((style: StyleVariables) => {
				this.loaderColor = style.primaryColor;
				this.style = style;
			});
	}

	ngOnInit() {
		this.subscription = this.loaderService.loaderState
		.subscribe((state: LoaderState) => {
			this.show = state.show;
			this.refresh = state.refresh;
		});

		this.settingsSubscription = this.util.getSettings
			.subscribe((settings: AppSettings) => {
				if (!!settings) {
					this.settings = settings;
					// this.loader_image = GlobalVariable.image_paths[settings['type']].loader;
				}
			});
	}

	ngOnDestroy() {
		this.show = false;
		this.refresh = false;
		this.subscription.unsubscribe();
		this.styleSubscription.unsubscribe();
		this.settingsSubscription.unsubscribe();
		this.loaderService.pageRefresh.next(false);
	}

}