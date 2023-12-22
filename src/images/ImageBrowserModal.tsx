import type { ComponentProps, FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import configurationManager from 'fontoxml-configuration/src/configurationManager';
import type {
	AssetId,
	BrowseResponseItem,
} from 'fontoxml-connectors-standard/src/types';
import {
	Button,
	Flex,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
	StateMessage,
	Toast,
} from 'fontoxml-design-system/src/components';
import type {
	FdsOnClickCallback,
	FdsOnKeyDownCallback,
} from 'fontoxml-design-system/src/types';
import type { ModalProps } from 'fontoxml-fx/src/types';
import useOperation from 'fontoxml-fx/src/useOperation';
import t from 'fontoxml-localization/src/t';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs';
import type { ViewMode } from '../shared/ModalBrowserListOrGridViewMode';
import ModalBrowserListOrGridViewMode, {
	VIEW_MODES,
} from '../shared/ModalBrowserListOrGridViewMode';
import ModalBrowserUploadButton from '../shared/ModalBrowserUploadButton';
import type { BrowseConfig, BrowseContext } from '../shared/useBrowse';
import useBrowse from '../shared/useBrowse';
import type { UploadConfig, UploadContext } from '../shared/useUpload';
import useUpload from '../shared/useUpload';
import ImageGridItem from './ImageGridItem';
import ImageListItem from './ImageListItem';
import ImagePreview from './ImagePreview';

const cmsBrowserUploadMaxFileSizeInBytes = configurationManager.get(
	'cms-browser-upload-max-file-size-in-bytes'
);

const cmsBrowserUploadMimeTypesToAccept = configurationManager.get(
	'cms-browser-upload-mime-types-to-accept'
);

const stateLabels: ComponentProps<
	typeof ModalBrowserFileAndFolderResultList
>['stateLabels'] = {
	loading: {
		title: t('Loading images…'),
		message: null,
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
			'This folder does not contain images that can be opened with Fonto.'
		),
	},
};
const previewStateLabels: ComponentProps<typeof ImagePreview>['stateLabels'] = {
	loadingPreview: {
		title: t('Loading image preview…'),
		message: null,
	},
	previewError: {
		title: t('Can’t open this image'),
		message: t(
			'Fonto can’t open this image. You can try again, or try a different image.'
		),
	},
};

type IncomingModalData = {
	browseContextDocumentId: RemoteDocumentId;
	insertOperationName?: string;
	modalIcon?: string;
	modalPrimaryButtonLabel?: string;
	modalTitle?: string;
	selectedImageId?: BrowseResponseItem['id'];
	query?: BrowseContext['query'];
};
type SubmittedModalData = {
	selectedImageId: string;
};

type Props = ModalProps<IncomingModalData, SubmittedModalData>;

const assetTypes = ['image'];
const resultTypes = ['file', 'folder'];

const browseConfig: BrowseConfig = {
	assetTypes,
	resultTypes,
	rootFolderLabel: t('Image library'),
};

const uploadConfig: UploadConfig = {
	errorMessages: {
		fileSizeTooLargeMessage: t(
			'This image is larger than {MAX_IMAGE_UPLOAD_SIZE} megabyte, please select another image or resize it and try again.',
			{
				MAX_IMAGE_UPLOAD_SIZE:
					Math.round(
						(cmsBrowserUploadMaxFileSizeInBytes / 1000000) * 100
					) / 100,
			}
		),
		invalidFileTypeMessage: t('This file type is not valid.'),
		serverErrorMessage: t(
			'Fonto can’t upload this image, please try again.'
		),
	},
	fileType: 'image',
	maxFileSizeInBytes: cmsBrowserUploadMaxFileSizeInBytes,
	mimeTypesToAccept: cmsBrowserUploadMimeTypesToAccept,
};

const ImageBrowserModal: FC<Props> = ({ cancelModal, data, submitModal }) => {
	const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.GRID);

	const browseContext = useMemo<BrowseContext>(
		() => ({
			query: data.query,
			remoteDocumentId: data.browseContextDocumentId,
		}),
		[data.browseContextDocumentId, data.query]
	);

	const { browse, browseRequestState } = useBrowse(
		browseContext,
		browseConfig
	);

	const [selectedItemId, setSelectedItemId] = useState<AssetId | null>(
		data.selectedImageId ?? null
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

	const uploadTargetFolder = useMemo(
		() => browseRequestState.folder,
		[browseRequestState.folder]
	);

	const uploadContext = useMemo<UploadContext>(
		() => ({
			metadata: {},
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			remoteDocumentId: data.browseContextDocumentId!,
			targetFolder: uploadTargetFolder,
		}),
		[data.browseContextDocumentId, uploadTargetFolder]
	);

	const { upload, uploadRequestState } = useUpload(
		uploadContext,
		uploadConfig
	);

	useEffect(() => {
		if (uploadTargetFolder && uploadRequestState.name === 'successful') {
			let canceled = false;

			void browse(
				data.browseContextDocumentId,
				uploadTargetFolder,
				true
			).then(() => {
				if (canceled) {
					return;
				}

				setSelectedItemId(uploadRequestState.item.id);
			});

			return () => {
				canceled = true;
			};
		}

		return undefined;
	}, [
		browse,
		data.browseContextDocumentId,
		uploadRequestState,
		uploadTargetFolder,
	]);

	const dataToSubmit = useMemo<SubmittedModalData | undefined>(() => {
		return selectedItem && selectedItem.type !== 'folder'
			? {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					selectedImageId: selectedItem.id!,
			  }
			: data.selectedImageId
			? {
					selectedImageId: data.selectedImageId,
			  }
			: undefined;
	}, [data.selectedImageId, selectedItem]);

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
			!operationState.enabled,
		[operationState.enabled, selectedItem]
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
			<ImageListItem
				key={key}
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				referrerDocumentId={data.browseContextDocumentId!}
				isDisabled={item.metadata?.isDisabled}
				isSelected={selectedItemId === item.id}
				item={item}
				onClick={onClick}
				onItemDoubleClick={handleItemDoubleClick}
			/>
		),
		[data.browseContextDocumentId, handleItemDoubleClick, selectedItemId]
	);

	const handleRenderGridItem = useCallback<
		ComponentProps<
			typeof ModalBrowserFileAndFolderResultList
		>['renderGridItem']
	>(
		({ key, item, onClick }) => (
			<ImageGridItem
				key={key}
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				referrerDocumentId={data.browseContextDocumentId!}
				isDisabled={item.metadata?.isDisabled}
				isSelected={selectedItemId === item.id}
				item={item}
				onClick={onClick}
				onItemDoubleClick={handleItemDoubleClick}
			/>
		),
		[data.browseContextDocumentId, handleItemDoubleClick, selectedItemId]
	);

	const handleSubmitButtonClick = useCallback<FdsOnClickCallback>(() => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		submitModal(dataToSubmit!);
	}, [dataToSubmit, submitModal]);

	const hasHierarchyItems =
		browseRequestState.name === 'successful' &&
		browseRequestState.hierarchyItems.length > 0;

	return (
		<Modal size="l" isFullHeight onKeyDown={handleKeyDown}>
			<ModalHeader
				icon={data.modalIcon}
				title={data.modalTitle || t('Select an image')}
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
								uploadRequestState={uploadRequestState}
							/>
						)}

						<Flex flex="none" spaceSize="l" alignItems="center">
							<ModalBrowserUploadButton
								browseRequest={browseRequestState}
								uploadRequest={uploadRequestState}
								mimeTypesToAccept={
									cmsBrowserUploadMimeTypesToAccept
								}
								uploadSelectedFiles={upload}
							/>

							<ModalBrowserListOrGridViewMode
								setViewMode={setViewMode}
								viewMode={viewMode}
							/>
						</Flex>
					</ModalContentToolbar>

					{uploadRequestState.name === 'errored' && (
						<ModalContent flex="none" paddingSize="m">
							<Toast
								connotation="error"
								icon="exclamation-triangle"
								content={uploadRequestState.errorMessage}
							/>
						</ModalContent>
					)}

					<ModalContent flexDirection="row">
						<ModalContent flexDirection="column">
							<ModalBrowserFileAndFolderResultList
								browseRequestState={browseRequestState}
								renderListItem={handleRenderListItem}
								renderGridItem={handleRenderGridItem}
								selectedItemId={selectedItemId}
								setSelectedItemId={setSelectedItemId}
								stateLabels={stateLabels}
								uploadRequestState={uploadRequestState}
								viewMode={viewMode}
							/>
						</ModalContent>

						{selectedItem && selectedItem.type !== 'folder' && (
							<ModalContent flexDirection="column">
								<ImagePreview
									heading={selectedItem.label}
									properties={
										selectedItem.metadata?.properties
									}
									referrerDocumentId={
										// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
										data.browseContextDocumentId!
									}
									// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
									remoteImageId={selectedItem.id!}
									stateLabels={previewStateLabels}
								/>
							</ModalContent>
						)}

						{/* Always show something in the "preview area" to
						prevent the layout from "jumping" when selecting an item
						in the grid. */}
						{(!selectedItem || selectedItem.type === 'folder') && (
							<ModalContent flexDirection="column">
								<StateMessage
									message={t(
										'Select an item in the list to the left.'
									)}
									paddingSize="m"
									title={t('No item selected')}
									visual="hand-pointer-o"
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

export default ImageBrowserModal;
