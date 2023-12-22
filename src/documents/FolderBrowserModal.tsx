import type { ComponentProps, FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type {
	BrowseResponseItem,
	FolderId,
} from 'fontoxml-connectors-standard/src/types';
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
} from 'fontoxml-design-system/src/components';
import type { FdsOnKeyDownCallback } from 'fontoxml-design-system/src/types';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs';
import type { ViewMode } from '../shared/ModalBrowserListOrGridViewMode';
import ModalBrowserListOrGridViewMode, {
	VIEW_MODES,
} from '../shared/ModalBrowserListOrGridViewMode';
import type { BrowseConfig, BrowseContext } from '../shared/useBrowse';
import useBrowse from '../shared/useBrowse';
import DocumentGridItem from './DocumentGridItem';
import DocumentListItem from './DocumentListItem';

const stateLabels: ComponentProps<
	typeof ModalBrowserFileAndFolderResultList
>['stateLabels'] = {
	loading: {
		title: t('Loading folders…'),
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t(
			'Fonto can’t open this folder. You can try again, or try a different folder.'
		),
	},
	empty: {
		title: t('No results'),
	},
};

type IncomingModalData = {
	browseContextDocumentId?: string;
	editId?: FolderId;
	editLabel?: string;
	modalTitle?: string;
	modalPrimaryButtonLabel?: string;
};
export type SubmittedModalData = {
	label: BrowseResponseItem['label'];
	remoteDocumentId: RemoteDocumentId | null;
};

type Props = ModalProps<IncomingModalData, SubmittedModalData>;

// TODO: always document?
const assetTypes = ['document'];
const resultTypes = ['folder'];

const browseConfig: BrowseConfig = {
	assetTypes,
	resultTypes,
	// TODO: Always Document library?
	rootFolderLabel: t('Document library'),
};

const FolderBrowserModal: FC<Props> = ({ cancelModal, data, submitModal }) => {
	const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.LIST);

	const browseContext = useMemo<BrowseContext>(
		() => ({ remoteDocumentId: data.browseContextDocumentId }),
		[data.browseContextDocumentId]
	);

	const { browse, browseRequestState } = useBrowse(
		browseContext,
		browseConfig
	);

	const [selectedItemId, setSelectedItemId] = useState<FolderId | null>(
		// Initially the selectedItemId is either the id of the folder being
		// edited or null, which means the root folder id, which is also valid.
		data.editId || null
	);

	const selectedItem = useMemo(
		() =>
			browseRequestState.name === 'successful'
				? browseRequestState.items.find(
						(item) => item.id === selectedItemId
				  ) ||
				  // if the selected item is not part of the current folder, maybe it
				  // is still part of the current hierarchy (eg. when entering a folder)
				  browseRequestState.hierarchyItems.find(
						(item) => item.id === selectedItemId
				  )
				: undefined,
		[browseRequestState, selectedItemId]
	);

	const dataToSubmit = useMemo<SubmittedModalData>(() => {
		return selectedItem
			? {
					label: selectedItem.label,
					remoteDocumentId: selectedItem.id,
			  }
			: data.editId
			? {
					label: data.editLabel,
					remoteDocumentId: data.editId,
			  }
			: undefined;
	}, [data.editId, data.editLabel, selectedItem]);

	const isSubmitButtonDisabled = useMemo(() => !dataToSubmit, [dataToSubmit]);

	const handleKeyDown = useCallback<FdsOnKeyDownCallback>(
		(event) => {
			switch (event.key) {
				case 'Escape':
					cancelModal();
					break;
				case 'Enter':
					if (!isSubmitButtonDisabled) {
						submitModal(dataToSubmit);
					}
					break;
			}
		},
		[cancelModal, dataToSubmit, isSubmitButtonDisabled, submitModal]
	);

	const handleBreadcrumbsItemClick = useCallback<
		ComponentProps<typeof ModalBrowserHierarchyBreadcrumbs>['onItemClick']
	>(
		(item) => {
			setSelectedItemId(item.id);

			void browse(data.browseContextDocumentId, item, true);
		},
		[browse, data.browseContextDocumentId]
	);

	const handleItemDoubleClick = useCallback(
		(item: BrowseResponseItem) => {
			if (item.type === 'folder') {
				setSelectedItemId(item.id);

				void browse(data.browseContextDocumentId, item);
			}
		},
		[browse, data.browseContextDocumentId]
	);

	const handleRenderListItem = useCallback<
		ComponentProps<
			typeof ModalBrowserFileAndFolderResultList
		>['renderListItem']
	>(
		({ key, item, onClick }) => (
			<DocumentListItem
				key={key}
				isDisabled={item.metadata?.isDisabled}
				isSelected={selectedItemId === item.id}
				item={item}
				onClick={onClick}
				onItemDoubleClick={handleItemDoubleClick}
			/>
		),
		[handleItemDoubleClick, selectedItemId]
	);

	const handleRenderGridItem = useCallback<
		ComponentProps<
			typeof ModalBrowserFileAndFolderResultList
		>['renderGridItem']
	>(
		({ key, item, onClick }) => (
			<DocumentGridItem
				key={key}
				isDisabled={item.metadata?.isDisabled}
				isSelected={selectedItemId === item.id}
				item={item}
				onClick={onClick}
				onItemDoubleClick={handleItemDoubleClick}
			/>
		),
		[handleItemDoubleClick, selectedItemId]
	);

	const handleSubmitButtonClick = useCallback(() => {
		submitModal(dataToSubmit);
	}, [dataToSubmit, submitModal]);

	const hasHierarchyItems =
		browseRequestState.name === 'successful' &&
		browseRequestState.hierarchyItems.length > 0;

	return (
		<Modal size="s" onKeyDown={handleKeyDown}>
			<ModalHeader title={data.modalTitle || t('Select a folder')} />

			<ModalBody>
				<ModalContent flexDirection="column">
					<ModalContentToolbar
						justifyContent={
							hasHierarchyItems ? 'space-between' : 'flex-end'
						}
					>
						{hasHierarchyItems && (
							<ModalBrowserHierarchyBreadcrumbs
								browseRequestState={browseRequestState}
								onItemClick={handleBreadcrumbsItemClick}
							/>
						)}

						<ModalBrowserListOrGridViewMode
							setViewMode={setViewMode}
							viewMode={viewMode}
						/>
					</ModalContentToolbar>

					<ModalContent flexDirection="column">
						<ModalBrowserFileAndFolderResultList
							browseRequestState={browseRequestState}
							renderListItem={handleRenderListItem}
							renderGridItem={handleRenderGridItem}
							selectedItemId={selectedItemId}
							setSelectedItemId={setSelectedItemId}
							stateLabels={stateLabels}
							viewMode={viewMode}
						/>
					</ModalContent>
				</ModalContent>
			</ModalBody>

			<ModalFooter>
				<Button
					type="default"
					label={t('Cancel')}
					onClick={cancelModal}
				/>

				<Button
					type="primary"
					label={data.modalPrimaryButtonLabel || t('Select')}
					isDisabled={isSubmitButtonDisabled}
					onClick={handleSubmitButtonClick}
				/>
			</ModalFooter>
		</Modal>
	);
};

export default FolderBrowserModal;
