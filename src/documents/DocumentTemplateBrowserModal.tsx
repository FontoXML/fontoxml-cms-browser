import type { ComponentProps, FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
} from 'fontoxml-design-system/src/components';
import type {
	FdsOnClickCallback,
	FdsOnKeyDownCallback,
} from 'fontoxml-design-system/src/types';
import type { ModalProps } from 'fontoxml-fx/src/types';
import useDocumentLoader from 'fontoxml-fx/src/useDocumentLoader';
import useOperation from 'fontoxml-fx/src/useOperation';
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
import DocumentPreview from './DocumentPreview';

const stateLabels: ComponentProps<
	typeof ModalBrowserFileAndFolderResultList
>['stateLabels'] = {
	loading: {
		title: t('Loading templates…'),
	},
	browseError: {
		title: t('Can’t open this folder'),
	},
	empty: {
		title: t('No results'),
		message: t(
			'This folder does not contain files that can be opened with Fonto.'
		),
	},
};
const previewStateLabels: ComponentProps<
	typeof DocumentPreview
>['stateLabels'] = {
	loadingPreview: {
		title: t('Loading template preview…'),
	},
};

type IncomingModalData = {
	browseContextDocumentId?: string;
	editId?: RemoteDocumentId;
	editLabel?: string;
	insertOperationName?: string;
	modalIcon?: string;
	modalPrimaryButtonLabel?: string;
	modalTitle?: string;
	query?: BrowseContext['query'];
};
export type SubmittedModalData = {
	label: BrowseResponseItem['label'];
	remoteDocumentId: RemoteDocumentId;
};

type Props = ModalProps<IncomingModalData, SubmittedModalData>;

const assetTypes = ['document-template'];
// TODO: just file?
const resultTypes = ['file'];

const browseConfig: BrowseConfig = {
	assetTypes,
	resultTypes,
	rootFolderLabel: t('Templates'),
};

const DocumentTemplateBrowserModal: FC<Props> = ({
	cancelModal,
	data,
	submitModal,
}) => {
	const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.LIST);

	const browseContext = useMemo<BrowseContext>(
		() => ({
			query: data.query,
			remoteDocumentId: data.browseContextDocumentId,
		}),
		[data.browseContextDocumentId, data.query]
	);

	const {
		browse,
		browseRequestState,
		deleteErrorForItem,
		hasErrorForItem,
		setErrorForItem,
	} = useBrowse(browseContext, browseConfig);

	const [selectedItemId, setSelectedItemId] =
		useState<RemoteDocumentId | null>(data.editId ?? null);

	const selectedItem = useMemo(
		() =>
			browseRequestState.name === 'successful'
				? browseRequestState.items.find(
						(item) => item.id === selectedItemId
				  )
				: undefined,
		[browseRequestState, selectedItemId]
	);

	const { isErrored, isLoading, documentId, error, retryLoadDocument } =
		useDocumentLoader(selectedItemId);

	useEffect(() => {
		if (error) {
			setErrorForItem(selectedItemId, error);
		} else if (documentId || isLoading) {
			deleteErrorForItem(selectedItemId);
		}
	}, [
		deleteErrorForItem,
		documentId,
		error,
		isLoading,
		selectedItemId,
		setErrorForItem,
	]);

	const dataToSubmit = useMemo<SubmittedModalData | undefined>(() => {
		return selectedItem && selectedItem.type !== 'folder'
			? {
					label: selectedItem.label,
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					remoteDocumentId: selectedItem.id!,
			  }
			: data.editId
			? {
					label: data.editLabel || '',
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					remoteDocumentId: data.editId!,
			  }
			: undefined;
	}, [data.editId, data.editLabel, selectedItem]);

	const operationData = useMemo(
		() => ({ ...data, ...dataToSubmit }),
		[data, dataToSubmit]
	);

	const { operationState } = useOperation(
		data.insertOperationName,
		operationData
	);

	const isSubmitButtonDisabled = useMemo(
		() =>
			!selectedItem ||
			selectedItem.type === 'folder' ||
			!documentId ||
			!operationState.enabled,
		[documentId, operationState.enabled, selectedItem]
	);

	const handleKeyDown = useCallback<FdsOnKeyDownCallback>(
		(event) => {
			switch (event.key) {
				case 'Escape':
					cancelModal();
					break;
				case 'Enter':
					if (!isSubmitButtonDisabled) {
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
						submitModal(dataToSubmit!);
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
			void browse(data.browseContextDocumentId, item, true);
		},
		[browse, data.browseContextDocumentId]
	);

	const handleItemDoubleClick = useCallback(
		(item: BrowseResponseItem) => {
			if (item.type === 'folder') {
				void browse(data.browseContextDocumentId, item);
			} else if (selectedItemId === item.id && !isSubmitButtonDisabled) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				submitModal(dataToSubmit!);
			}
		},
		[
			data.browseContextDocumentId,
			dataToSubmit,
			isSubmitButtonDisabled,
			browse,
			selectedItemId,
			submitModal,
		]
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
				isErrored={hasErrorForItem(item)}
				isSelected={selectedItemId === item.id}
				item={item}
				onClick={onClick}
				onItemDoubleClick={handleItemDoubleClick}
			/>
		),
		[handleItemDoubleClick, hasErrorForItem, selectedItemId]
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
				isErrored={hasErrorForItem(item)}
				isSelected={selectedItemId === item.id}
				item={item}
				onClick={onClick}
				onItemDoubleClick={handleItemDoubleClick}
			/>
		),
		[handleItemDoubleClick, hasErrorForItem, selectedItemId]
	);

	const handleSubmitButtonClick = useCallback<FdsOnClickCallback>(() => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		submitModal(dataToSubmit!);
	}, [dataToSubmit, submitModal]);

	const hasHierarchyItems =
		browseRequestState.name === 'successful' &&
		browseRequestState.hierarchyItems.length > 0;

	return (
		<Modal size="l" onKeyDown={handleKeyDown} isFullHeight>
			<ModalHeader
				icon={data.modalIcon}
				title={data.modalTitle || t('Select a template')}
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
								browseRequestState={browseRequestState}
								onItemClick={handleBreadcrumbsItemClick}
							/>
						)}

						<ModalBrowserListOrGridViewMode
							setViewMode={setViewMode}
							viewMode={viewMode}
						/>
					</ModalContentToolbar>

					<ModalContent flexDirection="row">
						<ModalContent flexDirection="column" flex="1">
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

						{selectedItem && selectedItem.type !== 'folder' && (
							<ModalContent flexDirection="column" flex="2">
								<DocumentPreview
									description={
										selectedItem.metadata?.description
									}
									documentId={documentId}
									error={error}
									isErrored={isErrored}
									isLoading={isLoading}
									// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
									remoteDocumentId={selectedItemId!}
									retryLoadDocument={retryLoadDocument}
									stateLabels={previewStateLabels}
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
					label={data.modalPrimaryButtonLabel || t('Select')}
					isDisabled={isSubmitButtonDisabled}
					onClick={handleSubmitButtonClick}
				/>
			</ModalFooter>
		</Modal>
	);
};

export default DocumentTemplateBrowserModal;
