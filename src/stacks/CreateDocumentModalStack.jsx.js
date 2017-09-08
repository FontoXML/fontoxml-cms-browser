import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { ModalStack } from 'fontoxml-vendor-fds/components';

import CreateDocumentFormModal from '../createDocumentFormModal/CreateDocumentFormModal.jsx';
import DocumentBrowserModal from '../documents/DocumentBrowserModal.jsx';
// import SelectDocumentTemplateBrowserModal from '../templates/TemplateBrowserModal.jsx';

const getLabels = () => ({
	create: {
		modalTitle: t('Create new document'),
		selectTemplateFormRowLabel: t('Template to start with'),
		selectTemplateButtonLabel: t('Select a template'),
		selectFolderFormRowLabel: t('Save in'),
		selectFolderButtonLabel: t('Select a folder'),
		titleFormRowLabel: t('Title'),
		cancelButtonLabel: t('Cancel'),
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
	}
});

class CreateDocumentFormModalStack extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			selectDocumentTemplateDataProviderName: PropTypes.string.isRequired,
			selectFolderDataProviderName: PropTypes.string.isRequired
		}).isRuired,
		submitModal: PropTypes.func.isRequired
	};

	state = {
		isSelectDocumentTemplateModalOpen: false,
		isSelectFolderModalOpen: false,

		selectedDocumentTemplate: null,
		selectedFolder: null
	};

	labels = getLabels();

	handleModalSubmit = modalData =>
		this.props.submitModal({
			selectedDocumentTemplateId: modalData.selectedDocumentTemplateId.id,
			selectedFolderId: modalData.selectedFolder.id,
			documentTitle: modalData.documentTitle
		});
	handleOpenSelectDocumentTemplateBrowserModal = () =>
		this.setState({ isSelectDocumentTemplateModalOpen: true });
	handleOpenSelectFolderBrowserModal = () => this.setState({ isSelectFolderModalOpen: true });

	handleSelectDocumentTemplateCloseModal = () =>
		this.setState({ isSelectDocumentTemplateModalOpen: false, selectedDocumentTemplate: null });
	handleDocumentTemplateSelect = selectedDocumentTemplate =>
		this.setState({ selectedDocumentTemplate });
	handleSelectDocumentTemplateSubmitModal = selectedDocumentTemplate =>
		this.setState({ isSelectDocumentTemplateModalOpen: false, selectedDocumentTemplate });

	handleSelectFolderCloseModal = () =>
		this.setState({ isSelectFolderModalOpen: false, selectedFolder: null });
	handleSelectFolderSubmitModal = selectedFolder =>
		this.setState({ isSelectFolderModalOpen: false, selectedFolder });

	render() {
		return (
			<ModalStack>
				<CreateDocumentFormModal
					labels={this.labels.create}
					closeModal={this.props.cancelModal}
					onModalSubmit={this.handleModalSubmit}
					openSelectDocumentTemplateBrowserModal={
						this.handleOpenSelectDocumentTemplateBrowserModal
					}
					openSelectFolderBrowserModal={this.handleOpenSelectFolderBrowserModal}
					selectedFolder={this.state.selectedFolder}
					selectedDocumentTemplate={this.state.selectedDocumentTemplate}
				/>

				{this.state.isSelectDocumentTemplateModalOpen && (
					<DocumentBrowserModal
						dataProviderName={this.props.data.selectDocumentTemplateDataProviderName}
						labels={this.labels.selectTemplate}
						closeModal={this.handleSelectDocumentTemplateCloseModal}
						onDocumentTemplateSelect={this.handleDocumentTemplateSelect}
						onModalSubmit={this.handleSelectDocumentTemplateSubmitModal}
						selectedDocumentTemplate={this.state.selectedDocumentTemplate}
						browseContextDocumentId={this.props.data.browseContextDocumentId}
					/>
				)}
			</ModalStack>
		);
		// data: {
		// 	browseContextDocumentId,
		// 	dataProviderName,
		// 	modalPrimaryButtonLabel,
		// 	modalTitle
		// },

		//
		// {this.state.isSelectFolderModalOpen && (
		// 	<SelectFolderBrowserModal
		// 		dataProviderName={this.props.data.selectFolderDataProviderName}
		// 		labels={this.labels.selectFolder}
		// 		closeModal={this.handleSelectFolderCloseModal}
		// 		onModalSubmit={this.handleSelectFolderSubmitModal}
		// 		browseContextDocumentId={this.props.data.browseContextDocumentId}
		// 	/>
		// )}
	}
}

export default CreateDocumentFormModalStack;
