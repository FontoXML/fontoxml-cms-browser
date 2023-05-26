import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import configurationManager from 'fontoxml-configuration/src/configurationManager';
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
} from 'fontoxml-design-system/src/components';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES,
} from '../shared/ModalBrowserListOrGridViewMode';
import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities';
import DocumentGridItem from './DocumentGridItem';
import DocumentListItem from './DocumentListItem';
import DocumentPreview from './DocumentPreview';

const cmsBrowserSendsHierarchyItemsInBrowseResponse = configurationManager.get(
	'cms-browser-sends-hierarchy-items-in-browse-response'
);

const stateLabels = {
	loading: {
		title: t('Loading templates…'),
		message: null,
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: null,
	},
	empty: {
		title: t('No results'),
		message: t(
			'This folder does not contain files that can be opened with Fonto.'
		),
	},
	loadingPreview: {
		title: t('Loading template preview…'),
		message: null,
	},
	previewError: {
		title: t('Can’t open this template'),
		message: t(
			'Fonto can’t open this template. You can try again, or try a different template.'
		),
	},
};

type ModalSubmitData = {
	remoteDocumentId: RemoteDocumentId;
	label: string;
};

function getSubmitModalData(itemToSubmit): ModalSubmitData {
	return {
		remoteDocumentId: itemToSubmit.id,
		label: itemToSubmit.label,
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.documentId);
}

type Props = ModalProps<
	{
		browseContextDocumentId?: string;
		dataProviderName: string;
		insertOperationName?: string;
		modalIcon?: string;
		modalPrimaryButtonLabel?: string;
		modalTitle?: string;
	},
	ModalSubmitData
> & {
	remoteDocumentId?: RemoteDocumentId;
};

let DocumentTemplateBrowserModal: FC<Props> = ({
	// ModalProps
	cancelModal,
	data: {
		browseContextDocumentId,
		modalIcon,
		modalPrimaryButtonLabel,
		modalTitle,
	},
	submitModal,

	remoteDocumentId = null,

	// TODO: all of these props come from the HoCs, type them there and reuse here
	determineAndHandleItemSubmitForSelectedItem,
	hierarchyItems,
	isItemErrored,
	isSubmitButtonDisabled,
	items,
	lastOpenedState,
	onInitialSelectedItemIdChange,
	onItemIsErrored,
	onItemIsLoaded,
	onItemSelect,
	onViewModeChange,
	refreshItems,
	request,
	selectedItem,
	viewMode,
}) => {
	const doubleClickedItemId = useRef(null);

	useEffect(() => {
		if (
			doubleClickedItemId.current !== null &&
			(selectedItem === null ||
				doubleClickedItemId.current !== selectedItem.id)
		) {
			doubleClickedItemId.current = null;
		}
	}, [selectedItem]);

	useEffect(() => {
		const initialSelectedItem = remoteDocumentId
			? { id: remoteDocumentId }
			: null;
		if (
			cmsBrowserSendsHierarchyItemsInBrowseResponse &&
			initialSelectedItem
		) {
			onInitialSelectedItemIdChange(initialSelectedItem);
			refreshItems(browseContextDocumentId, { id: null });
		} else if (
			lastOpenedState.hierarchyItems &&
			lastOpenedState.hierarchyItems.length > 1
		) {
			refreshItems(
				browseContextDocumentId,
				lastOpenedState.hierarchyItems[
					lastOpenedState.hierarchyItems.length - 1
				],
				false,
				lastOpenedState.hierarchyItems
			);
		} else {
			refreshItems(browseContextDocumentId, { id: null });
		}
	}, [
		browseContextDocumentId,
		lastOpenedState.hierarchyItems,
		onInitialSelectedItemIdChange,
		refreshItems,
		remoteDocumentId,
	]);

	const handleKeyDown = useCallback(
		(event) => {
			switch (event.key) {
				case 'Escape':
					cancelModal();
					break;
				case 'Enter':
					if (!isSubmitButtonDisabled) {
						submitModal(getSubmitModalData(selectedItem));
					}
					break;
			}
		},
		[cancelModal, isSubmitButtonDisabled, selectedItem, submitModal]
	);

	// Because we need to override the double click, because we need to add the documentId for submit.
	// This will be done right away if the selectedItem already has the documentId, else we have to wait
	// until the document is loaded in the preview.
	const handleItemDoubleClick = useCallback(
		(item) => {
			if (item.type === 'folder') {
				refreshItems(browseContextDocumentId, item);
			} else if (selectedItem.id === item.id && selectedItem.documentId) {
				determineAndHandleItemSubmitForSelectedItem(selectedItem);
			} else {
				doubleClickedItemId.current = item.id;
			}
		},
		[
			browseContextDocumentId,
			determineAndHandleItemSubmitForSelectedItem,
			refreshItems,
			selectedItem,
		]
	);

	const handleRenderListItem = useCallback(
		({ key, item, onClick, onRef }) => (
			<DocumentListItem
				key={key}
				isDisabled={item.isDisabled}
				isErrored={isItemErrored(item)}
				isSelected={selectedItem && selectedItem.id === item.id}
				item={
					item.icon || item.type === 'folder'
						? item
						: { ...item, icon: 'file-o' }
				}
				onClick={onClick}
				onDoubleClick={() => {
					handleItemDoubleClick(item);
				}}
				onRef={onRef}
			/>
		),
		[handleItemDoubleClick, isItemErrored, selectedItem]
	);

	const handleRenderGridItem = useCallback(
		({ key, item, onClick }) => (
			<DocumentGridItem
				key={key}
				isDisabled={item.isDisabled}
				isErrored={isItemErrored(item)}
				isSelected={selectedItem && selectedItem.id === item.id}
				item={
					item.icon || item.type === 'folder'
						? item
						: { ...item, icon: 'file-o' }
				}
				onClick={onClick}
				onDoubleClick={() => {
					handleItemDoubleClick(item);
				}}
			/>
		),
		[handleItemDoubleClick, isItemErrored, selectedItem]
	);

	const selectedItemId = useMemo(() => selectedItem?.id, [selectedItem?.id]);

	// Because the documentId is needed by submit, we need to add this to the selectedItem when the
	// preview is done loading. If the item was also double clicked, we want to submit right away.
	const handleLoadIsDone = useCallback(
		(documentId) => {
			const newSelectedItem = { id: selectedItemId, documentId };
			if (newSelectedItem.id === doubleClickedItemId.current) {
				determineAndHandleItemSubmitForSelectedItem(newSelectedItem);
			}
			onItemIsLoaded(newSelectedItem.id);
			onItemSelect(newSelectedItem);
		},
		[
			determineAndHandleItemSubmitForSelectedItem,
			onItemIsLoaded,
			onItemSelect,
			selectedItemId,
		]
	);

	const handleSubmitButtonClick = useCallback(() => {
		submitModal(getSubmitModalData(selectedItem));
	}, [selectedItem, submitModal]);

	const hasHierarchyItems = hierarchyItems.length > 0;

	return (
		<Modal size="l" onKeyDown={handleKeyDown} isFullHeight>
			<ModalHeader
				icon={modalIcon}
				title={modalTitle || t('Select a template')}
			/>

			<ModalBody>
				<ModalContent flexDirection="column">
					<ModalContentToolbar
						justifyContent={
							hasHierarchyItems ? 'space-between' : 'flex-end'
						}
					>
						{hasHierarchyItems && (
							<ModalBrowserHierarchyBreadcrumbs
								browseContextDocumentId={
									browseContextDocumentId
								}
								hierarchyItems={hierarchyItems}
								refreshItems={refreshItems}
								request={request}
							/>
						)}

						<ModalBrowserListOrGridViewMode
							onViewModeChange={onViewModeChange}
							viewMode={viewMode}
						/>
					</ModalContentToolbar>

					<ModalContent flexDirection="row">
						<ModalContent flexDirection="column" flex="1">
							<ModalBrowserFileAndFolderResultList
								browseContextDocumentId={
									browseContextDocumentId
								}
								items={items}
								onItemSelect={onItemSelect}
								refreshItems={refreshItems}
								renderListItem={handleRenderListItem}
								renderGridItem={handleRenderGridItem}
								request={request}
								selectedItem={selectedItem}
								stateLabels={stateLabels}
								viewMode={viewMode}
							/>
						</ModalContent>

						{selectedItem && selectedItem.type !== 'folder' && (
							<ModalContent flexDirection="column" flex="2">
								<DocumentPreview
									onItemIsErrored={onItemIsErrored}
									onLoadIsDone={handleLoadIsDone}
									selectedItem={selectedItem}
									stateLabels={stateLabels}
								/>
							</ModalContent>
						)}
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
					label={modalPrimaryButtonLabel || t('Select')}
					isDisabled={isSubmitButtonDisabled}
					onClick={handleSubmitButtonClick}
				/>
			</ModalFooter>
		</Modal>
	);
};
DocumentTemplateBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(
	DocumentTemplateBrowserModal
);
DocumentTemplateBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentTemplateBrowserModal);

export default DocumentTemplateBrowserModal;
