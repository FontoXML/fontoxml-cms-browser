import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { ModalStack } from 'fontoxml-design-system/src/components';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';

import CreateDocumentFormModal from '../documents/CreateDocumentFormModal';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal';
import FolderBrowserModal from '../documents/FolderBrowserModal';

type Props = ModalProps<{
	browseContextDocumentId?: string;
	insertOperationName?: string;
	isCancelable?: boolean;
	modalIcon?: string;
	modalTitle?: string;
	selectDocumentTemplateDataProviderName: string;
	selectFolderDataProviderName: string;
}>;

const CreateDocumentFormModalStack: FC<Props> = ({
	cancelModal,
	data,
	submitModal,
}) => {
	const [state, setState] = useState<{
		activeModal: string | null;
		selectedDocumentTemplate: $TSFixMeAny;
		selectedFolder: $TSFixMeAny;
	}>({
		activeModal: null,

		selectedDocumentTemplate: {},
		selectedFolder: {},
	});

	const handleSelectFolderClick = useCallback(() => {
		setState((state) => ({ ...state, activeModal: 'FolderBrowser' }));
	}, []);

	const handleSelectDocumentTemplateClick = useCallback(() => {
		setState((state) => ({
			...state,
			activeModal: 'DocumentTemplateBrowser',
		}));
	}, []);

	const handleCancelModal = useCallback(() => {
		setState((state) => ({ ...state, activeModal: null }));
	}, []);

	const handleDocumentTemplateSubmit = useCallback((submittedItem) => {
		setState((state) => ({
			...state,
			activeModal: null,
			selectedDocumentTemplate: submittedItem,
		}));
	}, []);

	const handleFolderSubmit = useCallback((submittedItem) => {
		setState((state) => ({
			...state,
			activeModal: null,
			selectedFolder: submittedItem,
		}));
	}, []);

	const {
		browseContextDocumentId,
		insertOperationName,
		isCancelable,
		modalIcon,
		modalTitle,
		selectDocumentTemplateDataProviderName,
		selectFolderDataProviderName,
	} = data;

	const { activeModal, selectedDocumentTemplate, selectedFolder } = state;

	return (
		<ModalStack>
			<CreateDocumentFormModal
				cancelModal={cancelModal}
				data={{
					insertOperationName,
					isCancelable,
				}}
				modalIcon={modalIcon}
				modalTitle={modalTitle || t('Create new document')}
				onSelectDocumentTemplateClick={
					handleSelectDocumentTemplateClick
				}
				onSelectFolderClick={handleSelectFolderClick}
				selectedDocumentTemplate={selectedDocumentTemplate}
				selectedFolder={selectedFolder}
				submitModal={submitModal}
			/>

			{activeModal === 'DocumentTemplateBrowser' && (
				<DocumentTemplateBrowserModal
					cancelModal={handleCancelModal}
					data={{
						browseContextDocumentId: null,
						dataProviderName:
							selectDocumentTemplateDataProviderName,
						modalTitle: t('Select a template for your document'),
					}}
					remoteDocumentId={selectedDocumentTemplate.remoteDocumentId}
					submitModal={handleDocumentTemplateSubmit}
				/>
			)}

			{activeModal === 'FolderBrowser' && (
				<FolderBrowserModal
					cancelModal={handleCancelModal}
					data={{
						browseContextDocumentId,
						dataProviderName: selectFolderDataProviderName,
						modalTitle: t(
							'Select a folder to save your documents in'
						),
					}}
					submitModal={handleFolderSubmit}
				/>
			)}
		</ModalStack>
	);
};

export default CreateDocumentFormModalStack;
