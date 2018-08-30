import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';
import layout from '../templates/components/layout-container';

/**
 * A layout container allows all other layouts to be placed in. Basically it sets the css position attribute to
 * relative so subcontainers can align onto that.
 *
 * HBS Example:
 * ```hbs
 * <LayoutContainer>
 *   ... put whatever you need here ...
 * </LayoutContainer>
 * ```
 *
 * HTML Example:
 * ```html
 * <div class="layout-container">
 *   ... put whatever you need here ...
 * </div>
 * ```
 */
@classNames('layout-container')
export default class LayoutContainer extends Component {
	/** @hidden */
	layout = layout;
}
