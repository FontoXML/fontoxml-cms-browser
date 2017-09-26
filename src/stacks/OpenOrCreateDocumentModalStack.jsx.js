import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { ButtonGroup, ModalBodyToolbar, ModalStack } from 'fontoxml-vendor-fds/components';

import CreateDocumentFormModal from '../documents/CreateDocumentFormModal.jsx';
import DocumentBrowserModal from '../documents/DocumentBrowserModal.jsx';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal.jsx';
import FolderBrowserModal from '../documents/FolderBrowserModal.jsx';

const tabs = [
	{
		tabId: 'create',
		label: t('Create new'),
		icon: 'plus'
	},
	{
		tabId: 'open',
		label: t('Open from'),
		icon: 'folder-open-o'
	}
];

class OpenOrCreateDocumentModalStack extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			modalTitle: PropTypes.string,
			openDocumentDataProviderName: PropTypes.string.isRequired,
			selectDocumentTemplateDataProviderName: PropTypes.string.isRequired,
			selectFolderDataProviderName: PropTypes.string.isRequired
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	state = {
		activeTab: tabs[1] /* open*/,
		activeModal: null,

		selectedDocumentTemplate: {},
		selectedFolder: {}
	};

	handleSelectFolderClick = () => this.setState({ activeModal: 'FolderBrowser' });
	handleSelectDocumentTemplateClick = () =>
		this.setState({ activeModal: 'DocumentTemplateBrowser' });

	handleTabItemClick = activeTab =>
		this.setState({ activeTab, selectedDocumentTemplate: {}, selectedFolder: {} });

	handleRenderModalBodyToolbar = () => (
		<ModalBodyToolbar>
			<ButtonGroup
				items={tabs}
				selectedItem={this.state.activeTab}
				onItemClick={this.handleTabItemClick}
			/>
		</ModalBodyToolbar>
	);

	handleCancelModal = () => this.setState({ activeModal: null });

	handleDocumentTemplateSubmit = submittedItem =>
		this.setState({
			activeModal: null,
			selectedDocumentTemplate: submittedItem
		});

	handleFolderSubmit = submittedItem =>
		this.setState({
			activeModal: null,
			selectedFolder: submittedItem
		});

	render() {
		const {
			data: {
				browseContextDocumentId,
				modalTitle,
				openDocumentDataProviderName,
				selectDocumentTemplateDataProviderName,
				selectFolderDataProviderName
			},
			cancelModal,
			submitModal
		} = this.props;
		const { activeModal, activeTab, selectedDocumentTemplate, selectedFolder } = this.state;
		const openOrCreateModalTitle = modalTitle || t('Open or create document');

		return (
			<ModalStack>
				{activeTab.tabId === 'open' && (
					<DocumentBrowserModal
						cancelModal={cancelModal}
						data={{
							browseContextDocumentId,
							dataProviderName: openDocumentDataProviderName,
							modalPrimaryButtonLabel: t('Open'),
							modalTitle: openOrCreateModalTitle
						}}
						renderModalBodyToolbar={this.handleRenderModalBodyToolbar}
						submitModal={submitModal}
					/>
				)}

				{activeTab.tabId === 'create' && (
					<CreateDocumentFormModal
						cancelModal={cancelModal}
						modalTitle={openOrCreateModalTitle}
						onSelectDocumentTemplateClick={this.handleSelectDocumentTemplateClick}
						onSelectFolderClick={this.handleSelectFolderClick}
						renderModalBodyToolbar={this.handleRenderModalBodyToolbar}
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
							dataProviderName: selectDocumentTemplateDataProviderName,
							modalTitle: t('Select a template for your document')
						}}
						remoteDocumentId={selectedDocumentTemplate.remoteDocumentId}
						submitModal={this.handleDocumentTemplateSubmit}
					/>
				)}

				{activeModal === 'FolderBrowser' && (
					<FolderBrowserModal
						cancelModal={this.handleCancelModal}
						data={{
							browseContextDocumentId,
							dataProviderName: selectFolderDataProviderName,
							modalTitle: t('Select a folder to save your documents in')
						}}
						submitModal={this.handleFolderSubmit}
					/>
				)}
			</ModalStack>
		);
	}
}

export default OpenOrCreateDocumentModalStack;
