import { ButtonGroup, ModalBodyToolbar, ModalStack } from 'fds/components';
import React, { Component } from 'react';

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

type Props = {
	cancelModal(...args: unknown[]): unknown;
	data: {
		browseContextDocumentId?: string;
		insertOperationName?: string;
		isCancelable?: boolean;
		modalIcon?: string;
		modalTitle?: string;
		openDocumentDataProviderName: string;
		selectDocumentTemplateDataProviderName: string;
		selectFolderDataProviderName: string;
	};
	submitModal(...args: unknown[]): unknown;
};

class OpenOrCreateDocumentModalStack extends Component<Props> {
	state = {
		// Show "open" tab by default
		activeTab: tabs[1],
		activeModal: null,

		selectedDocumentTemplate: {},
		selectedFolder: {},
	};

	handleSelectFolderClick = () => {
		this.setState({ activeModal: 'FolderBrowser' });
	};

	handleSelectDocumentTemplateClick = () => {
		this.setState({ activeModal: 'DocumentTemplateBrowser' });
	};

	handleTabItemClick = (activeTab) => {
		this.setState({
			activeTab,
			selectedDocumentTemplate: {},
			selectedFolder: {},
		});
	};

	handleRenderModalBodyToolbar = () => (
		<ModalBodyToolbar>
			<ButtonGroup
				items={tabs}
				selectedItem={this.state.activeTab}
				onItemClick={this.handleTabItemClick}
			/>
		</ModalBodyToolbar>
	);

	handleCancelModal = () => {
		this.setState({ activeModal: null });
	};

	handleDocumentTemplateSubmit = (submittedItem) => {
		this.setState({
			activeModal: null,
			selectedDocumentTemplate: submittedItem,
		});
	};

	handleFolderSubmit = (submittedItem) => {
		this.setState({
			activeModal: null,
			selectedFolder: submittedItem,
		});
	};

	render() {
		const {
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
		} = this.props;
		const {
			activeModal,
			activeTab,
			selectedDocumentTemplate,
			selectedFolder,
		} = this.state;
		const openOrCreateModalTitle =
			modalTitle || t('Open or create document');
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
						renderModalBodyToolbar={
							this.handleRenderModalBodyToolbar
						}
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
							this.handleSelectDocumentTemplateClick
						}
						onSelectFolderClick={this.handleSelectFolderClick}
						renderModalBodyToolbar={
							this.handleRenderModalBodyToolbar
						}
						selectedDocumentTemplate={selectedDocumentTemplate}
						selectedFolder={selectedFolder}
						submitModal={submitModal}
					/>
				)}

				{activeModal === 'DocumentTemplateBrowser' && (
					<DocumentTemplateBrowserModal
						cancelModal={this.handleCancelModal}
						data={{
							browseContextDocumentId: null,
							dataProviderName:
								selectDocumentTemplateDataProviderName,
							modalTitle: t(
								'Select a template for your document'
							),
						}}
						remoteDocumentId={
							selectedDocumentTemplate.remoteDocumentId
						}
						submitModal={this.handleDocumentTemplateSubmit}
					/>
				)}

				{activeModal === 'FolderBrowser' && (
					<FolderBrowserModal
						cancelModal={this.handleCancelModal}
						data={{
							browseContextDocumentId,
							dataProviderName: selectFolderDataProviderName,
							modalTitle: t(
								'Select a folder to save your documents in'
							),
						}}
						submitModal={this.handleFolderSubmit}
					/>
				)}
			</ModalStack>
		);
	}
}

export default OpenOrCreateDocumentModalStack;
