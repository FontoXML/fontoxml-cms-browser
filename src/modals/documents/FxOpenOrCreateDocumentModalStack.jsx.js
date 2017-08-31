import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { ModalStack } from 'fontoxml-vendor-fds/components';

import FxSelectFolderBrowserModal from '../folders/FxSelectFolderBrowserModal.jsx';

import FxOpenOrCreateDocumentModal from './FxOpenOrCreateDocumentModal.jsx';
import FxSelectDocumentTemplateBrowserModal from './FxSelectDocumentTemplateBrowserModal.jsx';

const getLabels = () => ({
	modalTitle: t('Open or create document'),
	createTab: {
		tabButtonLabel: t('Create new'),
		selectTemplateFormRowLabel: t('Template to start with'),
		selectTemplateButtonLabel: t('Select a template'),
		selectFolderFormRowLabel: t('Save in'),
		selectFolderButtonLabel: t('Select a folder'),
		titleFormRowLabel: t('Title'),
		submitButtonLabel: t('Create')
	},
	selectFolder: {
		modalTitle: t('Select a folder to save your documents in'),
		rootFolderLabel: t('My Drives'),
		states: {
			loading: {
				title: t('Loading folders…'),
				message: null
			},
			browseError: {
				title: t('Can’t open this folder'),
				message: null
			},
			empty: {
				title: t('No results'),
				message: null
			}
		},
		cancelButtonLabel: t('Cancel'),
		submitButtonLabel: t('Select')
	},
	selectTemplate: {
		modalTitle: t('Select a template for your document'),
		rootFolderLabel: t('Templates'),
		states: {
			loading: {
				title: t('Loading templates…'),
				message: null
			},
			browseError: {
				title: t('Can’t open this folder'),
				message: null
			},
			empty: {
				title: t('No results'),
				message: t('This folder does not contain files that can be opened with FontoXML.')
			},
			loadingPreview: {
				title: t('Loading template preview…'),
				message: null
			},
			previewError: {
				title: t('Can’t open this template'),
				message: t(
					'FontoXML can’t open this template. You can try again, or try a different template.'
				)
			}
		},
		cancelButtonLabel: t('Cancel'),
		submitButtonLabel: t('Select')
	},
	openTab: {
		tabButtonLabel: t('Open from'),
		rootFolderLabel: t('My Drives'),
		states: {
			loading: {
				title: t('Loading documents…'),
				message: null
			},
			browseError: {
				title: t('Can’t open this folder'),
				message: t(
					'FontoXML can’t open this folder. You can try again, or try a different folder.'
				)
			},
			empty: {
				title: t('No results'),
				message: t('This folder does not contain files that can be opened with FontoXML.')
			},
			loadingPreview: {
				title: t('Loading document preview…'),
				message: null
			},
			previewError: {
				title: t('Can’t open this document'),
				message: t(
					'FontoXML can’t open this document. You can try again, or try a different document.'
				)
			}
		},
		submitButtonLabel: t('Open')
	}
});

class FxOpenOrCreateDocumentModalStack extends Component {
	static propTypes = {
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			openDocumentDataProviderName: PropTypes.string.isRequired,
			selectDocumentTemplateDataProviderName: PropTypes.string.isRequired,
			selectFolderDataProviderName: PropTypes.string.isRequired
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	initialState = {
		isSelectFolderModalOpen: false,
		isSelectDocumentTemplateModalOpen: false,

		selectedFolder: null,
		selectedDocumentTemplate: null
	};

	state = this.initialState;

	labels = getLabels();

	handleTabSwitch = () => this.setState(this.initialState);
	handleModalSubmit = modalData => {
		const { submitModal } = this.props;

		if (modalData.activeTabId === 'create') {
			submitModal({
				selectedDocumentTemplateId: modalData.selectedDocumentTemplate.id,
				selectedFolderId: modalData.selectedFolder.id,
				documentTitle: modalData.documentTitle
			});
		} else if (modalData.activeTabId === 'open') {
			submitModal({ documentRemoteId: modalData.selectedDocument.id });
		}
	};
	handleOpenSelectFolderBrowserModal = () => this.setState({ isSelectFolderModalOpen: true });
	handleOpenSelectDocumentTemplateBrowserModal = () =>
		this.setState({ isSelectDocumentTemplateModalOpen: true });

	handleSelectFolderCloseModal = () =>
		this.setState({ isSelectFolderModalOpen: false, selectedFolder: null });
	handleSelectFolderSubmitModal = selectedFolder =>
		this.setState({ isSelectFolderModalOpen: false, selectedFolder });

	handleSelectDocumentTemplateCloseModal = () =>
		this.setState({ isSelectDocumentTemplateModalOpen: false, selectedDocumentTemplate: null });
	handleDocumentTemplateSelect = selectedDocumentTemplate =>
		this.setState({ selectedDocumentTemplate });
	handleSelectDocumentTemplateSubmitModal = selectedDocumentTemplate =>
		this.setState({ isSelectDocumentTemplateModalOpen: false, selectedDocumentTemplate });

	render() {
		return (
			<ModalStack>
				<FxOpenOrCreateDocumentModal
					dataProviderName={this.props.data.openDocumentDataProviderName}
					title={this.labels.modalTitle}
					createTabLabels={this.labels.createTab}
					openTabLabels={this.labels.openTab}
					onTabSwitch={this.handleTabSwitch}
					onModalSubmit={this.handleModalSubmit}
					openSelectFolderBrowserModal={this.handleOpenSelectFolderBrowserModal}
					openSelectDocumentTemplateBrowserModal={
						this.handleOpenSelectDocumentTemplateBrowserModal
					}
					selectedFolder={this.state.selectedFolder}
					selectedDocumentTemplate={this.state.selectedDocumentTemplate}
				/>

				{this.state.isSelectFolderModalOpen &&
					<FxSelectFolderBrowserModal
						dataProviderName={this.props.data.selectFolderDataProviderName}
						labels={this.labels.selectFolder}
						closeModal={this.handleSelectFolderCloseModal}
						onModalSubmit={this.handleSelectFolderSubmitModal}
					/>}

				{this.state.isSelectDocumentTemplateModalOpen &&
					<FxSelectDocumentTemplateBrowserModal
						dataProviderName={this.props.data.selectDocumentTemplateDataProviderName}
						labels={this.labels.selectTemplate}
						closeModal={this.handleSelectDocumentTemplateCloseModal}
						onDocumentTemplateSelect={this.handleDocumentTemplateSelect}
						onModalSubmit={this.handleSelectDocumentTemplateSubmitModal}
						selectedDocumentTemplate={this.state.selectedDocumentTemplate}
					/>}
			</ModalStack>
		);
	}
}

export default FxOpenOrCreateDocumentModalStack;
