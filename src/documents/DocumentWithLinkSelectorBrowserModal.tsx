import type { ComponentProps, FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import blueprintQuery from 'fontoxml-blueprints/src/blueprintQuery';
import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
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
import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { DocumentId } from 'fontoxml-documents/src/types';
import getNodeId from 'fontoxml-dom-identification/src/getNodeId';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import domInfo from 'fontoxml-dom-utils/src/domInfo';
import type { ModalProps } from 'fontoxml-fx/src/types';
import useDocumentLoader from 'fontoxml-fx/src/useDocumentLoader';
import useOperation from 'fontoxml-fx/src/useOperation';
import t from 'fontoxml-localization/src/t';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean';
import xq, { ensureXQExpression } from 'fontoxml-selectors/src/xq';

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
import DocumentWithLinkSelectorPreview from './DocumentWithLinkSelectorPreview';

const stateLabels: ComponentProps<
	typeof ModalBrowserFileAndFolderResultList
>['stateLabels'] = {
	loading: {
		title: t('Loading documents…'),
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t(
			'Fonto can’t open this folder. You can try again, or try a different folder.'
		),
	},
	empty: {
		title: t('No results'),
		message: t(
			'This folder does not contain files that can be opened with Fonto.'
		),
	},
};
const previewStateLabels: ComponentProps<
	typeof DocumentWithLinkSelectorPreview
>['stateLabels'] = {
	loadingPreview: {
		title: t('Loading document preview…'),
	},
};

type IncomingModalData = {
	browseContextDocumentId?: string;
	documentId?: string;
	insertOperationName?: string;
	linkableElementsQuery: string;
	modalIcon?: string;
	modalPrimaryButtonLabel?: string;
	modalTitle?: string;
	nodeId?: string;
	query?: BrowseContext['query'];
};

type SubmittedModalData = {
	id: RemoteDocumentId;
	remoteDocumentId: RemoteDocumentId;
	documentId: DocumentId;
	nodeId: NodeId;
};

type Props = ModalProps<IncomingModalData, SubmittedModalData>;

const assetTypes = ['document'];
const resultTypes = ['file', 'folder'];

const browseConfig: BrowseConfig = {
	assetTypes,
	resultTypes,
	rootFolderLabel: t('Document library'),
};

const DocumentWithLinkSelectorBrowserModal: FC<Props> = ({
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
		useState<RemoteDocumentId | null>(() =>
			data.documentId
				? documentsManager.getRemoteDocumentId(data.documentId)
				: null
		);

	const selectedItem = useMemo(
		() =>
			browseRequestState.name === 'successful'
				? browseRequestState.items.find(
						(item) => item.id === selectedItemId
				  )
				: undefined,
		[browseRequestState, selectedItemId]
	);

	const [nodeId, setNodeId] = useState<NodeId | null>(data.nodeId ?? null);

	const { isErrored, isLoading, documentId, error, retryLoadDocument } =
		useDocumentLoader(
			selectedItem && selectedItem.type !== 'folder'
				? selectedItemId
				: null
		);

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

	// Reset the nodeId to the document element after a document is loaded
	// (documentId from useDocumentLoader exists),
	// and nodeId is not set or set to a node from a different document.
	useEffect(() => {
		if (!documentId) {
			return;
		}

		if (
			nodeId &&
			documentsManager.getDocumentIdByNodeId(nodeId) === documentId
		) {
			return;
		}

		// documentId is loaded so documentNode will never be null, so add a !
		const documentNode = documentsManager.getDocumentNode(documentId)!;

		const documentElement = blueprintQuery.findChild(
			readOnlyBlueprint,
			documentNode,
			domInfo.isElement
		);
		if (
			documentElement &&
			evaluateXPathToBoolean(
				xq`let $selectableNodes := ${ensureXQExpression(
					data.linkableElementsQuery ?? '//*[@id]'
				)} return some $node in $selectableNodes satisfies . is $node`,
				documentElement,
				readOnlyBlueprint
			)
		) {
			setNodeId(getNodeId(documentElement));
		}
	}, [data.linkableElementsQuery, documentId, nodeId]);

	const dataToSubmit = useMemo<SubmittedModalData | undefined>(() => {
		return documentId &&
			nodeId &&
			selectedItem &&
			selectedItem.type !== 'folder'
			? {
					documentId,
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					id: selectedItem.id!,
					nodeId,
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					remoteDocumentId: selectedItem.id!,
			  }
			: data.documentId && data.nodeId && documentId === data.documentId
			? {
					documentId: data.documentId,
					id: documentsManager.getRemoteDocumentId(data.documentId)!,
					nodeId: data.nodeId,
					remoteDocumentId: documentsManager.getRemoteDocumentId(
						data.documentId
					)!,
			  }
			: undefined;
	}, [data.documentId, data.nodeId, documentId, nodeId, selectedItem]);

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
			!nodeId ||
			!operationState.enabled,
		[documentId, nodeId, operationState.enabled, selectedItem]
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
		<Modal size="l" isFullHeight={true} onKeyDown={handleKeyDown}>
			<ModalHeader
				icon={data.modalIcon}
				title={data.modalTitle || t('Select a link')}
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
								<DocumentWithLinkSelectorPreview
									documentId={documentId}
									error={error}
									isErrored={isErrored}
									isLoading={isLoading}
									linkableElementsQuery={
										data.linkableElementsQuery ?? '//*[@id]'
									}
									nodeId={nodeId ?? undefined}
									// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
									remoteDocumentId={selectedItemId!}
									retryLoadDocument={retryLoadDocument}
									setNodeId={setNodeId}
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
					label={data.modalPrimaryButtonLabel || t('Insert')}
					isDisabled={isSubmitButtonDisabled}
					onClick={handleSubmitButtonClick}
				/>
			</ModalFooter>
		</Modal>
	);
};

export default DocumentWithLinkSelectorBrowserModal;
