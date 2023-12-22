import type { ComponentProps, FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import {
	CancelModalContext,
	ModalStack,
} from 'fontoxml-design-system/src/components';
import type { FdsOnClickCallback } from 'fontoxml-design-system/src/types';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';
import type { OperationName } from 'fontoxml-operations/src/types';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

import CreateDocumentFormModal from '../documents/CreateDocumentFormModal';
import type { SubmittedModalData as DocumentTemplateBrowserSubmittedModalData } from '../documents/DocumentTemplateBrowserModal';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal';
import type { SubmittedModalData as FolderBrowserSubmittedModalData } from '../documents/FolderBrowserModal';
import FolderBrowserModal from '../documents/FolderBrowserModal';

type IncomingModalData = {
	browseContextDocumentId?: RemoteDocumentId;
	insertOperationName?: OperationName;
	isCancelable?: boolean;
	modalIcon?: string;
	modalTitle?: string;
};
type CreateDocumentFormModalSubmitModal = ComponentProps<
	typeof CreateDocumentFormModal
>['submitModal'];
type CreateDocumentFormModalSubmittedData =
	Parameters<CreateDocumentFormModalSubmitModal>[0];
type SubmittedModalData = CreateDocumentFormModalSubmittedData;

type Props = ModalProps<IncomingModalData, SubmittedModalData>;

const CreateDocumentFormModalStack: FC<Props> = ({
	cancelModal,
	data: {
		browseContextDocumentId,
		insertOperationName,
		isCancelable,
		modalIcon,
		modalTitle,
	},
	submitModal,
}) => {
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

	const handleTemplateOrFolderBrowserCancelModal = useCallback(() => {
		setActiveModal(undefined);
	}, []);

	const handleDocumentTemplateSubmit = useCallback<
		ComponentProps<typeof DocumentTemplateBrowserModal>['submitModal']
	>((submittedItem) => {
		setActiveModal(undefined);
		setSelectedDocumentTemplate(submittedItem);
	}, []);

	const handleFolderSubmit = useCallback<
		ComponentProps<typeof FolderBrowserModal>['submitModal']
	>((submittedItem) => {
		setActiveModal(undefined);
		setSelectedFolder(submittedItem);
	}, []);

	const createDocumentFormModalData = useMemo<
		ComponentProps<typeof CreateDocumentFormModal>['data']
	>(
		() => ({
			insertOperationName,
			isCancelable,
			modalIcon,
			modalTitle: modalTitle || t('Create new document'),
			selectedDocumentTemplate,
			selectedFolder,
		}),
		[
			insertOperationName,
			isCancelable,
			modalIcon,
			modalTitle,
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
			<CreateDocumentFormModal
				cancelModal={cancelModal}
				data={createDocumentFormModalData}
				onSelectDocumentTemplateClick={
					handleSelectDocumentTemplateClick
				}
				onSelectFolderClick={handleSelectFolderClick}
				submitModal={submitModal}
			/>

			<CancelModalContext.Provider
				value={handleTemplateOrFolderBrowserCancelModal}
			>
				{activeModal === 'DocumentTemplateBrowser' && (
					<DocumentTemplateBrowserModal
						cancelModal={handleTemplateOrFolderBrowserCancelModal}
						data={documentTemplateBrowserModalData}
						submitModal={handleDocumentTemplateSubmit}
					/>
				)}

				{activeModal === 'FolderBrowser' && (
					<FolderBrowserModal
						cancelModal={handleTemplateOrFolderBrowserCancelModal}
						data={folderBrowserModalData}
						submitModal={handleFolderSubmit}
					/>
				)}
			</CancelModalContext.Provider>
		</ModalStack>
	);
};

export default CreateDocumentFormModalStack;
