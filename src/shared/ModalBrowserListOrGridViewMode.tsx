import type { Dispatch, FC, SetStateAction } from 'react';
import { useCallback } from 'react';

import { ButtonGroup } from 'fontoxml-design-system/src/components';
import type { FdsOnItemClickCallback } from 'fontoxml-design-system/src/types';

// id and label are there for FDS ButtonGroup type compatibility,
// they are not used directly in the output/rendering.
export type ViewMode =
	| { icon: 'list'; id: 'list'; name: 'list'; label: '' }
	| { icon: 'th'; id: 'grid'; name: 'grid'; label: '' };

const viewModes: [ViewMode, ViewMode] = [
	{ id: 'list', name: 'list', icon: 'list', label: '' },
	{ id: 'grid', name: 'grid', icon: 'th', label: '' },
];

export const VIEW_MODES = {
	LIST: viewModes[0],
	GRID: viewModes[1],
};

type Props = {
	setViewMode: Dispatch<SetStateAction<ViewMode>>;
	viewMode: ViewMode;
};

const ModalBrowserListOrGridViewMode: FC<Props> = ({
	setViewMode,
	viewMode,
}) => {
	const handleItemClick = useCallback<FdsOnItemClickCallback>(
		(item: ViewMode) => {
			setViewMode(item);
		},
		[setViewMode]
	);

	return (
		<ButtonGroup
			items={viewModes}
			selectedItem={viewMode}
			onItemClick={handleItemClick}
		/>
	);
};

export default ModalBrowserListOrGridViewMode;
