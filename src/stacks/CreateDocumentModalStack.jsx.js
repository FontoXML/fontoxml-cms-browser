import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { ModalStack } from 'fontoxml-vendor-fds/components';

import CreateDocumentFormModal from '../createDocumentFormModal/CreateDocumentFormModal.jsx';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal.jsx';
import FolderBrowserModal from '../documents/FolderBrowserModal.jsx';

class CreateDocumentFormModalStack extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			modalTitle: PropTypes.string,
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
				selectDocumentTemplateDataProviderName,
				selectFolderDataProviderName
			},
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

				{activeModal === 'FolderBrowser' && (
					<FolderBrowserModal
						cancelModal={this.handleCancelModal}
						data={{
							browseContextDocumentId: browseContextDocumentId,
							dataProviderName: selectFolderDataProviderName,
							folderId: selectedFolder.id,
							modalTitle: t('Select a folder to save your documents in')
						}}
						submitModal={this.handleFolderSubmit}
					/>
				)}
			</ModalStack>
		);
	}
}

export default CreateDocumentFormModalStack;
