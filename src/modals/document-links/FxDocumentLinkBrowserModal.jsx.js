import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxDocumentLinkBrowser from '../../browsers/document-links/FxDocumentLinkBrowser.jsx';

import reactToAngularModalBridge from '../../reactToAngularModalBridge';

const getLabels = (isInEditFlow, linkType) => ({
	modalTitle: isInEditFlow ?
		t('Replace {LINK_TYPE, select, conref {reused content} other {cross link}}', { LINK_TYPE: linkType }) :
		t('Add {LINK_TYPE, select, conref {reused content} other {cross link}}', { LINK_TYPE: linkType }),
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
	submitButtonLabel: isInEditFlow ? t('Replace') : t('Add')
});

class FxDocumentLinkBrowserModal extends Component {
	constructor (props) {
		super(props);

		this.state = { selectedLink: reactToAngularModalBridge.operationData.targetSpec };

		this.labels = getLabels(
			!!reactToAngularModalBridge.operationData.targetSpec,
			reactToAngularModalBridge.operationData.linkType
		);
	}

	isSubmitPossible () {
		return !!this.state.selectedLink && (!!this.state.selectedLink.remoteDocumentId || !!this.state.selectedLink.documentId);
	}

	submit (link) {
		reactToAngularModalBridge.onModalSubmit({ selectedLink: link });
	}

	render () {
		const { selectedLink } = this.state;

		return (
			<Modal size='m' isFullHeight={ true }>
				<ModalHeader title={ this.labels.modalTitle } />

				<ModalBody paddingSize='l'>
					<FxDocumentLinkBrowser
						dataProviderName={ reactToAngularModalBridge.operationData.dataProviderName }
						labels={ this.labels }
						browseContextDocumentId={ reactToAngularModalBridge.operationData.browseContextDocumentId }
						linkableElementsQuery={ reactToAngularModalBridge.operationData.linkableElementsQuery }
						linkType={ reactToAngularModalBridge.operationData.linkType }
						selectedLink={ selectedLink }
						onLinkSelect={ (selectedLink) => this.setState({ selectedLink }) }
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
						onClick={ () => this.submit(this.state.selectedLink) }
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxDocumentLinkBrowserModal;
