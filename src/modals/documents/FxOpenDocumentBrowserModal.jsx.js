import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxDocumentBrowser from '../../browsers/documents/FxDocumentBrowser.jsx';

import reactToAngularModalBridge from '../../reactToAngularModalBridge';

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
			message: t('FontoXML can’t open this folder. You can try again, or try a different folder.')
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
			message: t('FontoXML can’t open this document. You can try again, or try a different document.')
		}
	},
	cancelButtonLabel: t('Cancel'),
	submitButtonLabel: t('Open')
});

class FxOpenDocumentBrowserModal extends Component {
	constructor (props) {
		super(props);

		this.state = { selectedDocument: null };

		this.labels = getLabels();
	}

	componentWillMount () {
		this.setState({ selectedDocument: null });
	}

	isSubmitPossible () {
		return this.state.selectedDocument !== null;
	}

	submit (document) {
		reactToAngularModalBridge.onModalSubmit({ selectedDocument: document });
	}

	render () {
		return (
			<Modal size='m'>
				<ModalHeader title={ this.labels.modalTitle } />

				<ModalBody paddingSize='l'>
					<FxDocumentBrowser
						dataProviderName={ reactToAngularModalBridge.operationData.dataProviderName }
						labels={ this.labels }
						browseContextDocumentId={ reactToAngularModalBridge.operationData.browseContextDocumentId }
						onDocumentSelect={ (selectedDocument) => this.setState({ selectedDocument }) }
						onDocumentOpen={ (openedDocument) => this.submit(openedDocument) }
					/>
				</ModalBody>

				<ModalFooter>
					<Button
						type='default'
						label={ this.labels.cancelButtonLabel }
						onClick={ () => reactToAngularModalBridge.closeModal() }
					/>

					<Button
						type='primary'
						label={ this.labels.submitButtonLabel }
						isDisabled={ !this.isSubmitPossible() }
						onClick={ () => this.submit(this.state.selectedDocument) }
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxOpenDocumentBrowserModal;
