import * as React from 'react';

import {
	ButtonGroup,
	ModalBodyToolbar,
	ModalStack,
} from 'fontoxml-design-system/src/components';
import type {
	FdsIconName,
	FdsLabelValue,
} from 'fontoxml-design-system/src/types';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';

import CreateDocumentFormModal from '../documents/CreateDocumentFormModal';
import DocumentBrowserModal from '../documents/DocumentBrowserModal';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal';
import FolderBrowserModal from '../documents/FolderBrowserModal';

const tabs = [
	{
		tabId: 'create',
		label: t('Create new'),
		icon: 'plus',
	},
	{
		tabId: 'open',
		label: t('Open from'),
		icon: 'folder-open-o',
	},
];

type Props = ModalProps<{
	browseContextDocumentId?: string;
	insertOperationName?: string;
	isCancelable?: boolean;
	modalIcon?: string;
	modalTitle?: string;
	openDocumentDataProviderName: string;
	selectDocumentTemplateDataProviderName: string;
	selectFolderDataProviderName: string;
}>;

const OpenOrCreateDocumentModalStack: React.FC<Props> = ({
	data: {
		browseContextDocumentId,
		insertOperationName,
		isCancelable,
		modalIcon,
		modalTitle,
		openDocumentDataProviderName,
		selectDocumentTemplateDataProviderName,
		selectFolderDataProviderName,
	},
	cancelModal,
	submitModal,
}) => {
	const [state, setState] = React.useState<{
		activeTab: {
			tabId: string;
			label: FdsLabelValue;
			icon: FdsIconName;
		};
		activeModal: string | null;

		selectedDocumentTemplate: { [key: string]: unknown };
		selectedFolder: { [key: string]: unknown };
	}>({
		// Show "open" tab by default
		activeTab: tabs[1],
		activeModal: null,

		selectedDocumentTemplate: {},
		selectedFolder: {},
	});

	const handleSelectFolderClick = React.useCallback(() => {
		setState((state) => ({ ...state, activeModal: 'FolderBrowser' }));
	}, []);

	const handleSelectDocumentTemplateClick = React.useCallback(() => {
		setState((state) => ({
			...state,
			activeModal: 'DocumentTemplateBrowser',
		}));
	}, []);

	const handleTabItemClick = React.useCallback((activeTab) => {
		setState((state) => ({
			...state,
			activeTab,
			selectedDocumentTemplate: {},
			selectedFolder: {},
		}));
	}, []);

	const handleRenderModalBodyToolbar = React.useCallback(
		() => (
			<ModalBodyToolbar>
				<ButtonGroup
					items={tabs}
					selectedItem={state.activeTab}
					onItemClick={handleTabItemClick}
				/>
			</ModalBodyToolbar>
		),
		[handleTabItemClick, state.activeTab]
	);

	const handleCancelModal = React.useCallback(() => {
		setState((state) => ({ ...state, activeModal: null }));
	}, []);

	const handleDocumentTemplateSubmit = React.useCallback((submittedItem) => {
		setState((state) => ({
			...state,
			activeModal: null,
			selectedDocumentTemplate: submittedItem,
		}));
	}, []);

	const handleFolderSubmit = React.useCallback((submittedItem) => {
		setState((state) => ({
			...state,
			activeModal: null,
			selectedFolder: submittedItem,
		}));
	}, []);

	const { activeModal, activeTab, selectedDocumentTemplate, selectedFolder } =
		state;
	const openOrCreateModalTitle = modalTitle || t('Open or create document');
	return (
		<ModalStack>
			{activeTab.tabId === 'open' && (
				<DocumentBrowserModal
					cancelModal={cancelModal}
					data={{
						browseContextDocumentId,
						dataProviderName: openDocumentDataProviderName,
						insertOperationName,
						isCancelable,
						modalIcon,
						modalPrimaryButtonLabel: t('Open'),
						modalTitle: openOrCreateModalTitle,
					}}
					renderModalBodyToolbar={handleRenderModalBodyToolbar}
					submitModal={submitModal}
				/>
			)}

			{activeTab.tabId === 'create' && (
				<CreateDocumentFormModal
					cancelModal={cancelModal}
					data={{
						insertOperationName,
						isCancelable,
					}}
					modalIcon={modalIcon}
					modalTitle={openOrCreateModalTitle}
					onSelectDocumentTemplateClick={
						handleSelectDocumentTemplateClick
					}
					onSelectFolderClick={handleSelectFolderClick}
					renderModalBodyToolbar={handleRenderModalBodyToolbar}
					selectedDocumentTemplate={selectedDocumentTemplate}
					selectedFolder={selectedFolder}
					submitModal={submitModal}
				/>
			)}

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

export default OpenOrCreateDocumentModalStack;
