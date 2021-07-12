import { ButtonGroup } from 'fds/components';
import React, { PureComponent } from 'react';

const viewModes = [
	{ name: 'list', icon: 'list' },
	{ name: 'grid', icon: 'th' },
];

export const VIEWMODES = {
	LIST: viewModes[0],
	GRID: viewModes[1],
};

type Props = {
	// from withModularBrowserCapabilities
	onViewModeChange(...args: unknown[]): unknown;
	viewMode: object;
};

class ModalBrowserListOrGridViewMode extends PureComponent<Props> {
	render() {
		return (
			<ButtonGroup
				items={viewModes}
				selectedItem={this.props.viewMode}
				onItemClick={this.props.onViewModeChange}
			/>
		);
	}
}

export default ModalBrowserListOrGridViewMode;
