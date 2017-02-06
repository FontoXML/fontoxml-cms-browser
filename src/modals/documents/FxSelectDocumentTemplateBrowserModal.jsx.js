import React, { PropTypes } from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxDocumentTemplateBrowser from '../../browsers/documents/FxDocumentTemplateBrowser.jsx';

const FxSelectDocumentTemplateBrowserModal = ({
	closeModal, onDocumentTemplateSelect, onModalSubmit,
	selectedDocumentTemplate,
	browseContextDocumentId,
	dataProviderName, labels,
}) => (
	<Modal size='m'>
		<ModalHeader title={ labels.modalTitle } />

		<ModalBody paddingSize='l'>
			<FxDocumentTemplateBrowser
				dataProviderName={ dataProviderName }
				labels={ labels }
				onDocumentTemplateSelect={ onDocumentTemplateSelect }
				onDocumentTemplateOpen={ (selectedDocumentTemplate) => onModalSubmit(selectedDocumentTemplate) }
				browseContextDocumentId={ browseContextDocumentId }
			/>
		</ModalBody>

		<ModalFooter>
			<Button type='default' label={ labels.cancelButtonLabel } onClick={ closeModal } />

			<Button
				type='primary'
				label={ labels.submitButtonLabel }
				isDisabled={ selectedDocumentTemplate === null }
				onClick={ () => onModalSubmit(selectedDocumentTemplate) }
			/>
		</ModalFooter>
	</Modal>
);

FxSelectDocumentTemplateBrowserModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	onDocumentTemplateSelect: PropTypes.func.isRequired,
	onModalSubmit: PropTypes.func.isRequired,
	selectedDocumentTemplate: PropTypes.object,
	browseContextDocumentId: PropTypes.string
};

FxSelectDocumentTemplateBrowserModal.defaultProps = {
	selectedDocumentTemplate: null,
	browseContextDocumentId: null
};

export default FxSelectDocumentTemplateBrowserModal;
