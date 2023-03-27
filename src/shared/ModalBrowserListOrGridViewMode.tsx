import * as React from 'react';

import { ButtonGroup } from 'fontoxml-design-system/src/components';

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

const ModalBrowserListOrGridViewMode: React.FC<Props> = ({
	onViewModeChange,
	viewMode,
}) => {
	return (
		<ButtonGroup
			items={viewModes}
			selectedItem={viewMode}
			onItemClick={onViewModeChange}
		/>
	);
};

export default ModalBrowserListOrGridViewMode;
