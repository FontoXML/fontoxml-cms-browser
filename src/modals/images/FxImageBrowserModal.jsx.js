import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxImageBrowser from '../../browsers/images/FxImageBrowser.jsx';

import reactToAngularModalBridge from '../../reactToAngularModalBridge';

const getLabels = (isInEditFlow) => ({
	modalTitle: isInEditFlow ? t('Replace image') : t('Add image'),
	rootFolderLabel: t('My Drives'),
	states: {
		loading: {
			title: t('Loading images…'),
			message: null
		},
		browseError: {
			title: t('Can’t open this folder'),
			message: t('FontoXML can’t open this folder. You can try again, or try a different folder.')
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
			message: t('FontoXML can’t open this image. You can try again, or try a different image.')
		}
	},
	cancelButtonLabel: t('Cancel'),
	submitButtonLabel: isInEditFlow ? t('Replace') : t('Add'),
	upload: {
		buttonLabel: t('Upload'),
		fileSizeTooLargeMessage: t('This image is larger than 4 megabyte, please select another image or resize it and try again.'),
		serverErrorMessage: t('FontoXML can’t upload this image, please try again.')
	}
});

class FxImageBrowserModal extends Component {
	constructor (props) {
		super(props);

		this.state = {
			selectedImageId: reactToAngularModalBridge.operationData && reactToAngularModalBridge.operationData.targetSpec ?
				reactToAngularModalBridge.operationData.targetSpec.remoteDocumentId :
				null
		};

		this.labels = getLabels(!!reactToAngularModalBridge.operationData.targetSpec);
	}

	isSubmitPossible () {
		return this.state.selectedImageId !== null;
	}

	submit (selectedImageId) {
		reactToAngularModalBridge.onModalSubmit({ selectedImageId });
	}

	render () {
		return (
			<Modal size='l' isFullHeight={ true }>
				<ModalHeader title={ this.labels.modalTitle } />

				<ModalBody paddingSize='l'>
					<FxImageBrowser
						dataProviderName={ reactToAngularModalBridge.operationData.dataProviderName }
						labels={ this.labels }
						browseContextDocumentId={ reactToAngularModalBridge.operationData.browseContextDocumentId }
						selectedImageId={ this.state.selectedImageId }
						onImageSelect={ (selectedImageId) => this.setState({ selectedImageId }) }
						onImageOpen={ (openedImageId) => this.submit(openedImageId) }
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
						onClick={ () => this.submit(this.state.selectedImageId) }
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxImageBrowserModal;
