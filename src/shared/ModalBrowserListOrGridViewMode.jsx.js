import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import { ButtonGroup } from 'fontoxml-vendor-fds/components';

export const viewModes = [{ name: 'list', icon: 'list' }, { name: 'grid', icon: 'th' }];

class ModalBrowserListOrGridViewMode extends PureComponent {
	static propTypes = {
		// from withModularBrowserCapabilities
		onUpdateViewMode: PropTypes.func.isRequired,
		viewMode: PropTypes.object.isRequired
	};

	render() {
		return (
			<ButtonGroup
				items={viewModes}
				selectedItem={this.props.viewMode}
				onItemClick={this.props.onUpdateViewMode}
			/>
		);
	}
}

export default ModalBrowserListOrGridViewMode;
