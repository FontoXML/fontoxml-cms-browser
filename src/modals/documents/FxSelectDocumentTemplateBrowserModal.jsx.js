import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxDocumentTemplateBrowser from '../../browsers/documents/FxDocumentTemplateBrowser.jsx';

class FxSelectDocumentTemplateBrowserModal extends Component {
	static defaultProps = {
		selectedDocumentTemplate: null,
		browseContextDocumentId: null
	};

	static PropTypes = {
		closeModal: PropTypes.func.isRequired,
		onDocumentTemplateSelect: PropTypes.func.isRequired,
		onModalSubmit: PropTypes.func.isRequired,
		selectedDocumentTemplate: PropTypes.object,
		browseContextDocumentId: PropTypes.string
	};

	handleDocumentTemplateOpen = selectedDocumentTemplate =>
		this.props.onModalSubmit(selectedDocumentTemplate);
	handleSubmitButton = () => this.props.onModalSubmit(this.props.selectedDocumentTemplate);

	render() {
		const { labels } = this.props;

		return (
			<Modal size="m">
				<ModalHeader title={labels.modalTitle} />

				<ModalBody paddingSize="l">
					<FxDocumentTemplateBrowser
						dataProviderName={this.props.dataProviderName}
						labels={labels}
						onDocumentTemplateSelect={this.props.onDocumentTemplateSelect}
						onDocumentTemplateOpen={this.handleDocumentTemplateOpen}
						browseContextDocumentId={this.props.browseContextDocumentId}
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
						isDisabled={this.props.selectedDocumentTemplate === null}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxSelectDocumentTemplateBrowserModal;
