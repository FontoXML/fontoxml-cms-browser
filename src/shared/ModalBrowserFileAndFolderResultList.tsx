import type { ComponentProps, Dispatch, FC, SetStateAction } from 'react';
import { useCallback } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import {
	SpinnerIcon,
	StateMessage,
	VirtualGrid,
	VirtualList,
} from 'fontoxml-design-system/src/components';
import type { FdsOnItemClickCallback } from 'fontoxml-design-system/src/types';

import type { ViewMode } from './ModalBrowserListOrGridViewMode';
import type useBrowse from './useBrowse';
import type useUpload from './useUpload';

type Props = {
	browseRequestState: ReturnType<typeof useBrowse>['browseRequestState'];
	renderGridItem: ComponentProps<typeof VirtualGrid>['renderItem'];
	renderListItem: ComponentProps<typeof VirtualList>['renderItem'];
	selectedItemId?: BrowseResponseItem['id'];
	setSelectedItemId: Dispatch<SetStateAction<BrowseResponseItem['id']>>;
	stateLabels: {
		browseError: {
			title?: string;
			message?: string;
		};
		empty: {
			title?: string;
			message?: string;
		};
		loading: {
			title?: string;
			message?: string;
		};
	};
	uploadRequestState?: ReturnType<typeof useUpload>['uploadRequestState'];
	viewMode: ViewMode;
};

const ModalBrowserFileAndFolderResultList: FC<Props> = ({
	browseRequestState,
	renderGridItem,
	renderListItem,
	selectedItemId,
	setSelectedItemId,
	stateLabels,
	uploadRequestState,
	viewMode,
}) => {
	const handleItemClick = useCallback<FdsOnItemClickCallback>(
		(item: BrowseResponseItem) => {
			if (
				browseRequestState.name === 'loading' ||
				(uploadRequestState && uploadRequestState.name === 'loading')
			) {
				return;
			}

			// Check if item is already selected, so that a documentId and/or nodeId on the selectedItem aren't overwritten
			if (!selectedItemId || item.id !== selectedItemId) {
				setSelectedItemId(item.id);
			}
		},
		[
			browseRequestState.name,
			selectedItemId,
			setSelectedItemId,
			uploadRequestState,
		]
	);

	if (
		browseRequestState.name === 'uninitialized' ||
		browseRequestState.name === 'loading'
	) {
		return (
			<StateMessage
				paddingSize="m"
				visual={<SpinnerIcon />}
				{...stateLabels.loading}
			/>
		);
	}

	if (browseRequestState.name === 'errored') {
		return (
			<StateMessage
				connotation="warning"
				paddingSize="m"
				visual="exclamation-triangle"
				{...stateLabels.browseError}
			/>
		);
	}

	if (browseRequestState.items.length === 0) {
		return (
			<StateMessage
				paddingSize="m"
				visual="folder-open-o"
				{...stateLabels.empty}
			/>
		);
	}

	if (viewMode.name === 'list') {
		return (
			<VirtualList
				estimatedItemHeight={30}
				idToScrollIntoView={selectedItemId || undefined}
				items={browseRequestState.items}
				onItemClick={handleItemClick}
				paddingSize="m"
				renderItem={renderListItem}
			/>
		);
	}

	// else the viewMode.name is 'grid'
	return (
		<VirtualGrid
			estimatedRowHeight={86}
			idToScrollIntoView={selectedItemId || undefined}
			items={browseRequestState.items}
			onItemClick={handleItemClick}
			paddingSize="m"
			renderItem={renderGridItem}
		/>
	);
};

export default ModalBrowserFileAndFolderResultList;
