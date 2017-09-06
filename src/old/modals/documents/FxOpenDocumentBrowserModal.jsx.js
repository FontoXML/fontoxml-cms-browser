import PropTypes from 'prop-types';
import React, { Component } from 'react';

import documentsManager from 'fontoxml-documents/documentsManager';
import t from 'fontoxml-localization/t';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxDocumentBrowser from '../../browsers/documents/FxDocumentBrowser.jsx';

const getLabels = () => ({
	modalTitle: t('Open document'),
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
	cancelButtonLabel: t('Cancel'),
	submitButtonLabel: t('Open')
});

class FxOpenDocumentBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	state = { selectedDocument: null };

	labels = getLabels();

	handleDocumentSelect = selectedDocument => this.setState({ selectedDocument });

	submit = document =>
		this.props.submitModal({
			documentId: documentsManager.getDocumentIdByRemoteDocumentId(
				this.state.selectedDocument.id
			),
			documentRemoteId: document.id
		});

	handleDocumentOpen = openedDocument => this.submit(openedDocument);

	handleSubmitButton = () => this.submit(this.state.selectedDocument);

	render() {
		return (
			<Modal size="m">
				<ModalHeader title={this.labels.modalTitle} />

				<ModalBody paddingSize="l">
					<FxDocumentBrowser
						dataProviderName={this.props.data.dataProviderName}
						labels={this.labels}
						browseContextDocumentId={this.props.data.browseContextDocumentId}
						onDocumentSelect={this.handleDocumentSelect}
						onDocumentOpen={this.handleDocumentOpen}
					/>
				</ModalBody>

				<ModalFooter>
					<Button
						type="default"
						label={this.labels.cancelButtonLabel}
						onClick={this.props.cancelModal}
					/>

					<Button
						type="primary"
						label={this.labels.submitButtonLabel}
						isDisabled={this.state.selectedDocument === null}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxOpenDocumentBrowserModal;
