import AthlasLayoutService from 'dummy/services/athlas-layout';

declare module '@ember/service' {
	interface Registry {
		'athlas-layout': AthlasLayoutService
	}
}
