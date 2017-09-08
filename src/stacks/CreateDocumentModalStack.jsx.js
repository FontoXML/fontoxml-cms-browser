import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { ModalStack } from 'fontoxml-vendor-fds/components';

import CreateDocumentFormModal from '../createDocumentFormModal/CreateDocumentFormModal.jsx';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal.jsx';
// import SelectDocumentTemplateBrowserModal from '../templates/TemplateBrowserModal.jsx';

class CreateDocumentFormModalStack extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			selectDocumentTemplateDataProviderName: PropTypes.string.isRequired,
			selectFolderDataProviderName: PropTypes.string.isRequired
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	state = {
		activeModal: null,

		selectedDocumentTemplate: {},
		selectedFolder: {}
	};

	handleSelectFolderClick = () => this.setState({ activeModal: 'FolderBrowser' });
	handleSelectDocumentTemplateClick = () =>
		this.setState({ activeModal: 'DocumentTemplateBrowser' });

	handleCancelModal = () => this.setState({ activeModal: null });

	handleDocumentTemplateSubmit = submittedItem =>
		this.setState({
			activeModal: null,
			selectedDocumentTemplate: submittedItem
		});

	dataForTemplateBrowser = {
		browseContextDocumentId: this.props.data.browseContextDocumentId,
		dataProviderName: this.props.data.selectDocumentTemplateDataProviderName,
		modalPrimaryButtonLabel: this.labels.selectTemplate.submitButtonLabel,
		modalTitle: this.labels.selectTemplate.modalTitle
	};

	render() {
		const {
			data: { modalTitle, selectDocumentTemplateDataProviderName },
			cancelModal,
			submitModal
		} = this.props;
		const { activeModal, selectedDocumentTemplate, selectedFolder } = this.state;
		return (
			<ModalStack>
				<CreateDocumentFormModal
					cancelModal={cancelModal}
					modalTitle={modalTitle || t('Create new document')}
					onSelectDocumentTemplateClick={this.handleSelectDocumentTemplateClick}
					onSelectFolderClick={this.handleSelectFolderClick}
					selectedDocumentTemplate={selectedDocumentTemplate}
					selectedFolder={selectedFolder}
					submitModal={submitModal}
				/>

				{activeModal === 'DocumentTemplateBrowser' && (
					<DocumentTemplateBrowserModal
						cancelModal={this.handleCancelModal}
						data={{
							browseContextDocumentId: null,
							dataProviderName: selectDocumentTemplateDataProviderName,
							modalTitle: t('Select a template for your document')
						}}
						remoteDocumentId={selectedDocumentTemplate.id}
						submitModal={this.handleDocumentTemplateSubmit}
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
