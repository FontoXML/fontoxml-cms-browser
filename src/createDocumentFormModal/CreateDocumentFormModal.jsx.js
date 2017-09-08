import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import CreateDocumentForm from './CreateDocumentForm.jsx';

class CreateDocumentFormModal extends Component {
	static PropTypes = {
		closeModal: PropTypes.func.isRequired,
		openSelectFolderBrowserModal: PropTypes.func.isRequired,
		openSelectDocumentTemplateBrowserModal: PropTypes.func.isRequired,
		onModalSubmit: PropTypes.func.isRequired,
		selectedFolder: PropTypes.object,
		selectedDocumentTemplate: PropTypes.object
	};

	state = {
		documentTitle: '',
		isSubmitting: false
	};

	handleDocumentTitleChange = documentTitle => this.setState({ documentTitle });

	isSubmitPossible = () =>
		this.state.documentTitle.trim().length > 0 &&
		this.props.selectedFolder !== null &&
		this.props.selectedDocumentTemplate !== null;

	handleSubmitButton = () => {
		const { documentTitle } = this.state;
		const { onModalSubmit, selectedFolder, selectedDocumentTemplate } = this.props;

		this.setState({ isSubmitting: true }, () => {
			onModalSubmit({
				documentTitle,
				selectedFolder,
				selectedDocumentTemplate
			});
		});
	};

	render() {
		const { labels } = this.props;
		const { isSubmitting } = this.state;

		return (
			<Modal size="s">
				<ModalHeader title={labels.modalTitle} />

				<ModalBody paddingSize="l">
					<CreateDocumentForm
						dataProviderName={this.props.dataProviderName}
						labels={labels}
						documentTitle={this.state.documentTitle}
						onDocumentTitleChange={this.handleDocumentTitleChange}
						openSelectFolderBrowserModal={this.props.openSelectFolderBrowserModal}
						openSelectDocumentTemplateBrowserModal={
							this.props.openSelectDocumentTemplateBrowserModal
						}
						selectedFolder={this.props.selectedFolder}
						selectedDocumentTemplate={this.props.selectedDocumentTemplate}
					/>
				</ModalBody>

				<ModalFooter>
					<Button
						type="default"
						label={labels.cancelButtonLabel}
						onClick={this.props.closeModal}
					/>

					<Button
						type="primary"
						label={labels.submitButtonLabel}
						iconAfter={isSubmitting ? 'spinner' : ''}
						isDisabled={!this.isSubmitPossible() || isSubmitting}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default CreateDocumentFormModal;
