import Service from '@ember/service';

export default class AthlasLayoutService extends Service {
	pageSwitchBtnClass: string = 'btn-secondary';

	splitOrientation: string = 'vertical';
	splitPosition: string = '50%';
	splitLimit: number = 10;

	tabPosition: string = 'top';
	tabShape: string = 'tabs';
	tabFill: boolean = false;
	tabJustified: boolean = false;
}
