import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../templates/components/fill-layout';

/**
 * Takes up the whole screen available to it.
 *
 * HBS Example:
 * ```hbs
 * <FillLayout>
 *   ... put whatever you need here ...
 * </FillLayout>
 * ```
 *
 * HTML Example:
 * ```html
 * <div class="layout-fill">
 *   ... put whatever you need here ...
 * </div>
 * ```
 */
@classNames('layout-container', 'layout-fill')
export default class FillLayout extends Component {
	/** @hidden */
	layout = layout;
}
