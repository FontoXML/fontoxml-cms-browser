import PropTypes from 'prop-types';
import React, { Component } from 'react';

import documentsManager from 'fontoxml-documents/documentsManager';
import t from 'fontoxml-localization/t';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxDocumentLinkBrowser from '../../browsers/document-links/FxDocumentLinkBrowser.jsx';

const getLabels = (isInEditFlow, linkType) => ({
	modalTitle: isInEditFlow
		? t('Replace {LINK_TYPE, select, conref {reused content} other {cross link}}', {
				LINK_TYPE: linkType
			})
		: t('Add {LINK_TYPE, select, conref {reused content} other {cross link}}', {
				LINK_TYPE: linkType
			}),
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
	submitButtonLabel: isInEditFlow ? t('Replace') : t('Add')
});

class FxDocumentLinkBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			documentId: PropTypes.string,
			linkableElementsQuery: PropTypes.string.isRequired,
			linkType: PropTypes.string,
			nodeId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	state = {
		selectedLink: {
			remoteDocumentId: this.props.data.documentId
				? documentsManager.getDocumentFile(this.props.data.documentId).remoteDocumentId
				: null,
			documentId: this.props.data.documentId,
			nodeId: this.props.data.nodeId
		}
	};

	labels = getLabels(this.props.data.documentId !== null, this.props.data.linkType);

	handleDocumentLinkBrowserLinkSelect = selectedLink => this.setState({ selectedLink });

	handleSubmitClick = () =>
		this.props.submitModal({
			documentId: this.state.selectedLink.documentId,
			nodeId: this.state.selectedLink.nodeId
		});

	render() {
		const { selectedLink } = this.state;

		return (
			<Modal size="m" isFullHeight={true}>
				<ModalHeader title={this.labels.modalTitle} />

				<ModalBody paddingSize="l">
					<FxDocumentLinkBrowser
						dataProviderName={this.props.data.dataProviderName}
						labels={this.labels}
						browseContextDocumentId={this.props.data.browseContextDocumentId}
						linkableElementsQuery={this.props.data.linkableElementsQuery}
						linkType={this.props.data.linkType}
						selectedLink={selectedLink}
						onLinkSelect={this.handleDocumentLinkBrowserLinkSelect}
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
						isDisabled={selectedLink.documentId === null}
						onClick={this.handleSubmitClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxDocumentLinkBrowserModal;
