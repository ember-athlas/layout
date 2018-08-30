import AthlasLayoutService from '@ember-athlas/layout/services/athlas-layout';
import { classNames } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';
import { isBlank } from '@ember/utils';
import layout from '../templates/components/split-layout';

const O_HORIZONTAL = 'horizontal';
const O_VERTICAL = 'vertical';

@classNames('layout-split')
export default class SplitLayout extends Component {
	layout = layout;
	@service('athlas-layout') athlas!: AthlasLayoutService;

	// arguments

	position: string = this.position || this.athlas.splitPosition;
	orientation: string = this.orientation || this.athlas.splitOrientation;
	limit: number = this.limit || this.athlas.splitLimit;
	sash?: string;
	positionChanged?: Function;

	// props

	unit: string = '';
	recentValue: number = -1;
	observer!: MutationObserver;
	visibilityStates: boolean[] = [true, true];

	checkingVisibility: boolean = false;
	created: boolean = false;
	resizing: boolean = false;
	updating: boolean = false;

	firstChild!: HTMLElement;
	lastChild!: HTMLElement;
	splitter!: HTMLElement;
	grabber!: HTMLElement;
	sashHandle?: HTMLElement;

	resizeOrigin: number = 0;
	splitterOrigin: number = 0;


	constructor() {
		super(...arguments);

		this.addObserver('position', () => {
			if (!this.created || this.resizing || this.updating) {
				return;
			}

			this.update(true);
		});

		this.addObserver('orientation', () => {
			if (!this.created) {
				return;
			}

			this.resetChild(this.firstChild);
			this.resetChild(this.lastChild);
			this.resetChild(this.splitter);
			this.updateOrientation();
			this.update(true);
		});

		this.addObserver('sash', () => {
			if (!this.created) {
				return;
			}

			this.updateSash();
		});

		this.addObserver('visibilityStates', () => {
			const childsAreVisible = this.areChildsVisible();
			this.splitter.style.display = childsAreVisible ? 'block' : 'none';

			if (childsAreVisible) {
				this.update(true);
			} else {
				this.resetChilds();
			}
		});
	}

	didInsertElement() {
		super.didInsertElement();

		scheduleOnce('afterRender', this, () => {
			this.lazySetup();
			this.checkVisibility();
		});

		Object.defineProperty(this.element, 'update', {
			value: (force: boolean = false) => {
				this.update(force);
			}
		});
	}

	lazySetup() {
		if (this.created) {
			return;
		}

		const element = this.element as HTMLElement;

		if (element.offsetParent !== null) {
			this.create();
		} else {
			const check = () => {
				if (!element) {
					return;
				}

				if (element.offsetParent !== null) {
					this.create();
				} else {
					window.requestAnimationFrame(check);
				}
			};

			window.requestAnimationFrame(check);
		}
	}

	create() {
		const firstChild = document.querySelector(`#${this.elementId} > *:first-child`) as HTMLElement;
		const lastChild = document.querySelector(`#${this.elementId} > *:last-child`) as HTMLElement;

		if (!firstChild && !lastChild) {
			return;
		}

		const splitter = document.createElement('div');
		splitter.classList.add('layout-split-splitter');
		this.element.insertBefore(splitter, lastChild);

		const grabber = document.createElement('div');
		grabber.classList.add('layout-split-grabber');
		splitter.appendChild(grabber);
		splitter.addEventListener('mousedown', this);
		splitter.addEventListener('touchstart', this, {passive: true});

		document.body.addEventListener('mouseup', this);
		document.body.addEventListener('touchend', this);
		document.body.addEventListener('mousemove', this);
		document.body.addEventListener('touchmove', this);

		this.set('firstChild', firstChild);
		this.set('lastChild', lastChild);
		this.set('splitter', splitter);
		this.set('grabber', grabber);
		this.set('visibilityStates', [
			this.getStyle(firstChild, 'display') !== 'none',
			this.getStyle(lastChild, 'display') !== 'none'
		]);

		this.updateSash();
		this.updateOrientation();

		// observe style changes
		this.observer = new MutationObserver(() => {
			this.checkVisibility();
		});
		this.observer.observe(firstChild, { attributes: true, attributeFilter: ['style', 'class'] });
		this.observer.observe(lastChild, { attributes: true, attributeFilter: ['style', 'class'] });
		this.observer.observe(this.get('element'), { attributes: true, attributeFilter: ['style', 'class'] });

		// observe viewport
		window.addEventListener('resize', this);
		this.set('created', true);
	}

	updateSash() {
		if (this.sashHandle) {
			this.sashHandle.classList.remove('layout-split-grabber-h');
			this.sashHandle.classList.remove('layout-split-grabber-v');
			this.sashHandle.removeEventListener('mousedown', this);
			this.sashHandle.removeEventListener('touchstart', this);
		}

		this.grabber.style.display = isBlank(this.sash) ? 'block' : 'none';
		this.sashHandle = !isBlank(this.sash) ? document.querySelector(this.sash!)! as HTMLElement: this.grabber;
		this.sashHandle.classList.add('layout-split-grabber-' + (this.orientation === O_HORIZONTAL ? 'h' : 'v'));
		this.sashHandle.addEventListener('mousedown', this);
		this.sashHandle.addEventListener('touchstart', this, {passive: true});
	}

	updateOrientation() {
		const splitter = this.get('splitter');

		splitter.classList.remove('layout-split-splitter-v');
		splitter.classList.remove('layout-split-splitter-h');
		splitter.classList.add('layout-split-splitter-' + (this.orientation === O_HORIZONTAL ? 'h' : 'v'));

		if (this.sashHandle) {
			this.sashHandle.classList.remove('layout-split-grabber-h');
			this.sashHandle.classList.remove('layout-split-grabber-v');
			this.sashHandle.classList.add('layout-split-grabber-' + (this.orientation === O_HORIZONTAL ? 'h' : 'v'));
		}
	}

	willDestroy() {
		this._super(...arguments);

		if (this.created) {
			if (this.sashHandle) {
				this.sashHandle.removeEventListener('mousedown', this);
				this.sashHandle.removeEventListener('touchstart', this);
			}

			this.splitter.removeEventListener('mousedown', this);
			this.splitter.removeEventListener('touchstart', this);

			document.body.removeEventListener('mouseup', this);
			document.body.removeEventListener('touchend', this);
			document.body.removeEventListener('mousemove', this);
			document.body.removeEventListener('touchmove', this);


			this.observer.disconnect();
			window.removeEventListener('resize', this);
		}
	}

	resetChild(child: HTMLElement) {
		child.style.top = '';
		child.style.left = '';
		child.style.right = '';
		child.style.bottom = '';
		child.style.width = '';
		child.style.height = '';
	}

	resetChilds() {
		if (!this.visibilityStates[0]) {
			this.resetChild(this.lastChild);
		}

		if (!this.visibilityStates[1]) {
			this.resetChild(this.firstChild);
		}
	}

	checkVisibility() {
		if (this.updating || this.resizing || !this.created) {
			return;
		}

		const firstChildVisible = this.getStyle(this.firstChild, 'display') !== 'none';
		const lastChildVisible = this.getStyle(this.lastChild, 'display') !== 'none';

		if (this.visibilityStates[0] !== firstChildVisible || this.visibilityStates[1] !== lastChildVisible) {
			this.set('visibilityStates', [firstChildVisible, lastChildVisible]);
		}
	}

	areChildsVisible() {
		return this.visibilityStates[0] && this.visibilityStates[1];
	}

	handleEvent(e: Event) {
		switch (e.type) {
			case 'resize':
				this.checkVisibility();
				break;

			case 'mousedown':
			case 'touchstart':
				e.preventDefault();
				this.startResizing(e as MouseEvent & TouchEvent);
				this.trigger('resizingStarted');
				break;

			case 'mouseup':
			case 'touchend':
				this.stopResizing();
				this.trigger('resizingEnded');
				break;

			case 'mousemove':
			case 'touchmove':
				if (this.resizing) {
					this.resize(e as MouseEvent & TouchEvent);
					e.preventDefault();
				}
				break;
		}
	}

	startResizing(e: MouseEvent & TouchEvent) {
		if (this.resizing) {
			return;
		}

		this.resizeOrigin = this.orientation === O_HORIZONTAL
			? (e.type === 'touchstart' ? e.touches[0].clientY : e.clientY)
			: (e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);

		this.splitterOrigin = this.orientation === O_HORIZONTAL
			? this.splitter.offsetTop + (this.getHeight(this.splitter) / 2)
			: this.splitter.offsetLeft + (this.getWidth(this.splitter) / 2);

		this.resizing = true;
		document.body.classList.add('resizing');
	}

	resize(e: MouseEvent & TouchEvent) {
		const pos = this.orientation === O_HORIZONTAL
			? (e.type === 'touchmove' ? e.touches[0].clientY : e.clientY)
			: (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX);
		const offset = pos - this.resizeOrigin;

		this.setPosition(this.splitterOrigin + offset);
	}

	stopResizing() {
		this.resizing = false;
		document.body.classList.remove('resizing');
	}

	update(force = false) {
		this.updating = true;
		this.trigger('updatingStarted');

		// unit
		this.unit = this.position.endsWith('%') ? '%' : 'px';

		// value
		let value: number = this.recentValue!;
		if (value === -1 || force) {
			value = parseInt(this.position);

			if (this.unit === '%') {
				const node = this.element as HTMLElement;
				let max = this.orientation === O_HORIZONTAL
					? this.getHeight(node)
					: this.getWidth(node);

				value = value / 100 * max;
			}
		}

		this.resetChilds();
		if (this.areChildsVisible() && value !== this.recentValue || force) {
			this.setPosition(value);
		}

		this.updating = false;
		this.trigger('updatingEnded');
	}

	setPosition(value: number) {
		const element = this.element as HTMLElement;

		if (this.orientation === O_HORIZONTAL) {
			const max = this.getHeight(element);
			const splitterHeight = this.getHeight(this.splitter);

			let splitterTop: string | number = Math.max(Math.min(value - (splitterHeight / 2), max - this.limit), this.limit);
			let top: string | number = splitterTop + splitterHeight;

			if (this.unit === '%') {
				splitterTop = (top / max * 100) + '%';
				top = 'calc(' + splitterTop + ' + ' + (splitterHeight / 2) + 'px)';
			} else if (this.unit === 'px') {
				splitterTop = splitterTop + 'px';
				top = top + 'px';
			}

			this.firstChild.style.top = '0';
			this.firstChild.style.height = splitterTop as string;
			this.lastChild.style.top = top as string;
			this.splitter.style.top = splitterTop as string;
			this.updatePosition(splitterTop as string);

		} else if (this.orientation === O_VERTICAL) {
			const max = this.getWidth(element);
			const splitterWidth = this.getWidth(this.splitter);

			let splitterLeft: string | number = Math.max(Math.min(value - (splitterWidth / 2), max - this.limit), this.limit);
			let left: string | number = splitterLeft + splitterWidth;

			if (this.unit === '%') {
				splitterLeft = Math.round(left / max * 100) + '%';
				left = 'calc(' + splitterLeft + ' + ' + (splitterWidth / 2) + 'px)';
			} else if (this.unit === 'px') {
				splitterLeft = splitterLeft + 'px';
				left = left + 'px';
			}

			this.firstChild.style.left = '0';
			this.firstChild.style.width = splitterLeft as string;
			this.lastChild.style.left = left as string;
			this.splitter.style.left = splitterLeft as string;
			this.updatePosition(splitterLeft as string);
		}

		this.recentValue = value;
	}

	updatePosition(value: string) {
		value = Math.round(parseInt(value)) + this.unit;
		if (this.positionChanged) {
			this.positionChanged(value);
		} else {
			this.position = value;
		}
	}

	getWidth(node: HTMLElement): number {
		if (node.style.display === 'none') {
			return 0;
		}

		const boxSizing = node.style.boxSizing || 'content-box';
		let width = node.clientWidth;

		// add margin
		width += this.getIntStyle(node, 'margin-left');
		width += this.getIntStyle(node, 'margin-right');

		// add border and padding
		if (boxSizing === 'content-box') {
			width += this.getIntStyle(node, 'padding-left');
			width += this.getIntStyle(node, 'padding-right');

			width += this.getIntStyle(node, 'border-left-width');
			width += this.getIntStyle(node, 'border-right-width');
		}

		return width;
	}

	getHeight(node: HTMLElement): number {
		if (node.style.display === 'none') {
			return 0;
		}

		const boxSizing = node.style.boxSizing || 'content-box';
		let height = node.clientHeight;

		// add margin
		height += this.getIntStyle(node, 'margin-top');
		height += this.getIntStyle(node, 'margin-bottom');

		// add border and padding
		if (boxSizing === 'content-box') {
			height += this.getIntStyle(node, 'padding-top');
			height += this.getIntStyle(node, 'padding-bottom');

			height += this.getIntStyle(node, 'border-top-width');
			height += this.getIntStyle(node, 'border-bottom-width');
		}

		return height;
	}

	getAdditionalBounds(node: HTMLElement): number {
		if (this.orientation === O_HORIZONTAL) {
			let height = 0;
			height += this.getIntStyle(node, 'margin-top');
			height += this.getIntStyle(node, 'margin-bottom');
			height += this.getIntStyle(node, 'padding-top');
			height += this.getIntStyle(node, 'padding-bottom');
			height += this.getIntStyle(node, 'border-top-width');
			height += this.getIntStyle(node, 'border-bottom-width');

			return height;
		} else {
			let width = 0;
			width += this.getIntStyle(node, 'margin-left');
			width += this.getIntStyle(node, 'margin-right');
			width += this.getIntStyle(node, 'padding-left');
			width += this.getIntStyle(node, 'padding-right');
			width += this.getIntStyle(node, 'border-left-width');
			width += this.getIntStyle(node, 'border-right-width');

			return width;
		}
	}

	getOffsetX(element: HTMLElement): number {
		let offset = 0;

		offset += element.offsetLeft;

		if (element !== document.body) {
			offset += this.getOffsetX(element.parentElement!);
		}

		return offset;
	}

	getOffsetY(element: HTMLElement): number {
		let offset = 0;

		offset += element.offsetTop;

		if (element !== document.body) {
			offset += this.getOffsetY(element.parentElement!);
		}

		return offset;
	}

	getIntStyle(element: HTMLElement, property: string): number {
		return parseInt(this.getStyle(element, property));
	}

	getStyle(element: HTMLElement, property: string): string {
		return window.getComputedStyle(element, null).getPropertyValue(property);
	}
}

