import type { ComponentProps, FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import {
	ButtonGroup,
	CancelModalContext,
	ModalBodyToolbar,
	ModalStack,
} from 'fontoxml-design-system/src/components';
import type {
	FdsIconName,
	FdsLabelValue,
	FdsOnClickCallback,
	FdsOnItemClickCallback,
} from 'fontoxml-design-system/src/types';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';
import type { OperationName } from 'fontoxml-operations/src/types';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

import CreateDocumentFormModal from '../documents/CreateDocumentFormModal';
import DocumentBrowserModal from '../documents/DocumentBrowserModal';
import type { SubmittedModalData as DocumentTemplateBrowserSubmittedModalData } from '../documents/DocumentTemplateBrowserModal';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal';
import type { SubmittedModalData as FolderBrowserSubmittedModalData } from '../documents/FolderBrowserModal';
import FolderBrowserModal from '../documents/FolderBrowserModal';

type Tab = {
	id: string;
	label: FdsLabelValue;
	icon: FdsIconName;
};

const tabs: Tab[] = [
	{
		id: 'create',
		label: t('Create new'),
		icon: 'plus',
	},
	{
		id: 'open',
		label: t('Open from'),
		icon: 'folder-open-o',
	},
];

type CreateDocumentFormModalSubmitModal = ComponentProps<
	typeof CreateDocumentFormModal
>['submitModal'];
type CreateDocumentFormModalSubmittedData =
	Parameters<CreateDocumentFormModalSubmitModal>[0];
type DocumentBrowserModalSubmitModal = ComponentProps<
	typeof DocumentBrowserModal
>['submitModal'];
type DocumentBrowserModalSubmittedData =
	Parameters<DocumentBrowserModalSubmitModal>[0];

type Props = ModalProps<
	{
		browseContextDocumentId?: RemoteDocumentId;
		insertOperationName?: OperationName;
		isCancelable?: boolean;
		modalIcon?: string;
		modalTitle?: string;
	},
	CreateDocumentFormModalSubmittedData | DocumentBrowserModalSubmittedData
>;

const OpenOrCreateDocumentModalStack: FC<Props> = ({
	data: {
		browseContextDocumentId,
		insertOperationName,
		isCancelable,
		modalIcon,
		modalTitle,
	},
	cancelModal,
	submitModal,
}) => {
	const [activeTab, setActiveTab] = useState<Tab>(tabs[1]);

	const [activeModal, setActiveModal] = useState<string>();

	const [selectedDocumentTemplate, setSelectedDocumentTemplate] =
		useState<DocumentTemplateBrowserSubmittedModalData>();

	const [selectedFolder, setSelectedFolder] =
		useState<FolderBrowserSubmittedModalData>();

	const handleSelectFolderClick = useCallback<FdsOnClickCallback>(() => {
		setActiveModal('FolderBrowser');
	}, []);

	const handleSelectDocumentTemplateClick =
		useCallback<FdsOnClickCallback>(() => {
			setActiveModal('DocumentTemplateBrowser');
		}, []);

	const handleTabItemClick = useCallback<FdsOnItemClickCallback>(
		(activeTab: Tab) => {
			setActiveTab(activeTab);
			setSelectedDocumentTemplate(undefined);
			setSelectedFolder(undefined);
		},
		[]
	);

	const handleRenderModalBodyToolbar = useCallback(
		() => (
			<ModalBodyToolbar>
				<ButtonGroup
					items={tabs}
					selectedItem={activeTab}
					onItemClick={handleTabItemClick}
				/>
			</ModalBodyToolbar>
		),
		[activeTab, handleTabItemClick]
	);

	const handleTemplateOrFolderBrowserCancelModal = useCallback(() => {
		setActiveModal(undefined);
	}, []);

	const handleDocumentTemplateBrowserSubmitModal = useCallback<
		ComponentProps<typeof DocumentTemplateBrowserModal>['submitModal']
	>((submittedItem) => {
		setActiveModal(undefined);

		setSelectedDocumentTemplate(submittedItem);
	}, []);

	const handleFolderBrowserSubmitModal = useCallback<
		ComponentProps<typeof FolderBrowserModal>['submitModal']
	>((submittedItem) => {
		setActiveModal(undefined);

		setSelectedFolder(submittedItem);
	}, []);

	const openOrCreateModalTitle = useMemo(
		() => modalTitle || t('Open or create document'),
		[modalTitle]
	);

	const documentBrowserModalData = useMemo<
		ComponentProps<typeof CreateDocumentFormModal>['data']
	>(
		() => ({
			browseContextDocumentId,
			insertOperationName,
			isCancelable,
			modalIcon,
			modalPrimaryButtonLabel: t('Open'),
			modalTitle: openOrCreateModalTitle,
		}),
		[
			browseContextDocumentId,
			insertOperationName,
			isCancelable,
			modalIcon,
			openOrCreateModalTitle,
		]
	);
	const createDocumentFormModalData = useMemo<
		ComponentProps<typeof CreateDocumentFormModal>['data']
	>(
		() => ({
			insertOperationName,
			isCancelable,
			modalIcon,
			modalTitle: openOrCreateModalTitle,
			selectedDocumentTemplate,
			selectedFolder,
		}),
		[
			insertOperationName,
			isCancelable,
			modalIcon,
			openOrCreateModalTitle,
			selectedDocumentTemplate,
			selectedFolder,
		]
	);
	const documentTemplateBrowserModalData = useMemo<
		ComponentProps<typeof DocumentTemplateBrowserModal>['data']
	>(
		() => ({
			browseContextDocumentId: undefined,
			editId: selectedDocumentTemplate?.remoteDocumentId,
			editLabel: selectedDocumentTemplate?.label,
			modalTitle: t('Select a template for your document'),
		}),
		[
			selectedDocumentTemplate?.label,
			selectedDocumentTemplate?.remoteDocumentId,
		]
	);
	const folderBrowserModalData = useMemo<
		ComponentProps<typeof FolderBrowserModal>['data']
	>(
		() => ({
			browseContextDocumentId,
			editId: selectedFolder?.remoteDocumentId || undefined,
			editLabel: selectedFolder?.label,
			modalTitle: t('Select a folder to save your documents in'),
		}),
		[
			browseContextDocumentId,
			selectedFolder?.label,
			selectedFolder?.remoteDocumentId,
		]
	);

	return (
		<ModalStack>
			{activeTab.id === 'open' && (
				<DocumentBrowserModal
					cancelModal={cancelModal}
					data={documentBrowserModalData}
					renderModalBodyToolbar={handleRenderModalBodyToolbar}
					submitModal={submitModal as DocumentBrowserModalSubmitModal}
				/>
			)}

			{activeTab.id === 'create' && (
				<CreateDocumentFormModal
					cancelModal={cancelModal}
					data={createDocumentFormModalData}
					onSelectDocumentTemplateClick={
						handleSelectDocumentTemplateClick
					}
					onSelectFolderClick={handleSelectFolderClick}
					renderModalBodyToolbar={handleRenderModalBodyToolbar}
					submitModal={
						submitModal as CreateDocumentFormModalSubmitModal
					}
				/>
			)}

			<CancelModalContext.Provider
				value={handleTemplateOrFolderBrowserCancelModal}
			>
				{activeModal === 'DocumentTemplateBrowser' && (
					<DocumentTemplateBrowserModal
						cancelModal={handleTemplateOrFolderBrowserCancelModal}
						data={documentTemplateBrowserModalData}
						submitModal={handleDocumentTemplateBrowserSubmitModal}
					/>
				)}

				{activeModal === 'FolderBrowser' && (
					<FolderBrowserModal
						cancelModal={handleTemplateOrFolderBrowserCancelModal}
						data={folderBrowserModalData}
						submitModal={handleFolderBrowserSubmitModal}
					/>
				)}
			</CancelModalContext.Provider>
		</ModalStack>
	);
};

export default OpenOrCreateDocumentModalStack;
