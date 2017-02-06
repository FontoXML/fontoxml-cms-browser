import React, { Component, PropTypes } from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxCreateDocumentForm from '../../forms/create-document/FxCreateDocumentForm.jsx';

class FxCreateDocumentFormModal extends Component {
	constructor (props) {
		super(props);

		this.initialState = {
			documentTitle: '',
			isSubmitting: false
		};

		this.state = this.initialState;
	}

	componentWillMount () {
		this.setState(this.initialState);
	}

	isSubmitPossible () {
		const { documentTitle } = this.state;
		const { selectedFolder, selectedDocumentTemplate } = this.props;

		return documentTitle.trim().length > 0 && selectedFolder !== null && selectedDocumentTemplate !== null;
	}

	submit () {
		const { documentTitle } = this.state;
		const { onModalSubmit, selectedFolder, selectedDocumentTemplate } = this.props;

		this.setState({ isSubmitting: true }, () => {
			onModalSubmit({
				documentTitle,
				selectedFolder,
				selectedDocumentTemplate
			});
		});
	}

	render () {
		const {
			closeModal,
			openSelectFolderBrowserModal, openSelectDocumentTemplateBrowserModal,
			selectedFolder, selectedDocumentTemplate,
			dataProviderName, labels
		} = this.props;
		const { documentTitle, isSubmitting } = this.state;

		return (
			<Modal size='s'>
				<ModalHeader title={ labels.modalTitle } />

				<ModalBody paddingSize='l'>
					<FxCreateDocumentForm
						dataProviderName={ dataProviderName }
						labels={ labels }
						documentTitle={ documentTitle }
						onDocumentTitleChange={ (documentTitle) => this.setState({ documentTitle }) }
						openSelectFolderBrowserModal={ openSelectFolderBrowserModal }
						openSelectDocumentTemplateBrowserModal={ openSelectDocumentTemplateBrowserModal }
						selectedFolder={ selectedFolder }
						selectedDocumentTemplate={ selectedDocumentTemplate }
					/>
				</ModalBody>

				<ModalFooter>
					<Button type='default' label={ labels.cancelButtonLabel } onClick={ closeModal } />

					<Button
						type='primary'
						label={ labels.submitButtonLabel }
						iconAfter={ isSubmitting ? 'spinner' : '' }
						isDisabled={ !this.isSubmitPossible() || isSubmitting }
						onClick={ () => this.submit() }
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

FxCreateDocumentFormModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	openSelectFolderBrowserModal: PropTypes.func.isRequired,
	openSelectDocumentTemplateBrowserModal: PropTypes.func.isRequired,
	onModalSubmit: PropTypes.func.isRequired,
	selectedFolder: PropTypes.object,
	selectedDocumentTemplate: PropTypes.object
};

export default FxCreateDocumentFormModal;
