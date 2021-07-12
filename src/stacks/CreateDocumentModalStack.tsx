import { ModalStack } from 'fds/components';
import React, { Component } from 'react';

import t from 'fontoxml-localization/src/t';

import CreateDocumentFormModal from '../documents/CreateDocumentFormModal';
import DocumentTemplateBrowserModal from '../documents/DocumentTemplateBrowserModal';
import FolderBrowserModal from '../documents/FolderBrowserModal';

type Props = {
	cancelModal(...args: unknown[]): unknown;
	data: {
		browseContextDocumentId?: string;
		insertOperationName?: string;
		isCancelable?: boolean;
		modalIcon?: string;
		modalTitle?: string;
		selectDocumentTemplateDataProviderName: string;
		selectFolderDataProviderName: string;
	};
	submitModal(...args: unknown[]): unknown;
};

class CreateDocumentFormModalStack extends Component<Props> {
	state = {
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
				selectDocumentTemplateDataProviderName,
				selectFolderDataProviderName,
			},
			cancelModal,
			submitModal,
		} = this.props;
		const { activeModal, selectedDocumentTemplate, selectedFolder } =
			this.state;
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
						this.handleSelectDocumentTemplateClick
					}
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

export default CreateDocumentFormModalStack;
