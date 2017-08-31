import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxImageBrowser from '../../browsers/images/FxImageBrowser.jsx';

const getLabels = isInEditFlow => ({
	modalTitle: isInEditFlow ? t('Replace image') : t('Add image'),
	rootFolderLabel: t('My Drives'),
	states: {
		loading: {
			title: t('Loading images…'),
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
			message: t('This folder does not contain images that can be opened with FontoXML.')
		},
		loadingPreview: {
			title: t('Loading image preview…'),
			message: null
		},
		previewError: {
			title: t('Can’t open this image'),
			message: t(
				'FontoXML can’t open this image. You can try again, or try a different image.'
			)
		}
	},
	cancelButtonLabel: t('Cancel'),
	submitButtonLabel: isInEditFlow ? t('Replace') : t('Add'),
	upload: {
		buttonLabel: t('Upload'),
		fileSizeTooLargeMessage: t(
			'This image is larger than 4 megabyte, please select another image or resize it and try again.'
		),
		serverErrorMessage: t('FontoXML can’t upload this image, please try again.')
	}
});

class FxImageBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			selectedImageId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	labels = getLabels(this.props.data.selectedImageId !== null);
	state = { selectedImageId: this.props.data.selectedImageId };

	submit(selectedImageId) {
		this.props.submitModal({ selectedImageId });
	}

	handleImageBrowserImageSelect = selectedImageId => this.setState({ selectedImageId });
	handleImageBrowserImageOpen = openedImageId => this.submit(openedImageId);

	handleSubmitButtonClick = () => this.submit(this.state.selectedImageId);

	render() {
		return (
			<Modal size="l" isFullHeight={true}>
				<ModalHeader title={this.labels.modalTitle} />

				<ModalBody paddingSize="l">
					<FxImageBrowser
						dataProviderName={this.props.data.dataProviderName}
						labels={this.labels}
						browseContextDocumentId={this.props.data.browseContextDocumentId}
						selectedImageId={this.state.selectedImageId}
						onImageSelect={this.handleImageBrowserImageSelect}
						onImageOpen={this.handleImageBrowserImageOpen}
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
						isDisabled={this.state.selectedImageId === null}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxImageBrowserModal;
