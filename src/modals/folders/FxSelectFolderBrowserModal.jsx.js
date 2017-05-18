import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxFolderBrowser from '../../browsers/folders/FxFolderBrowser.jsx';

class FxSelectFolderBrowserModal extends Component {
	constructor (props) {
		super(props);

		this.state = { selectedFolder: null };
	}

	render () {
		const { selectedFolder } = this.state;
		const { closeModal, onModalSubmit, browseContextDocumentId, labels, dataProviderName } = this.props;

		return (
			<Modal size='s'>
				<ModalHeader title={ labels.modalTitle } />

				<ModalBody paddingSize='l'>
					<FxFolderBrowser
						dataProviderName={ dataProviderName }
						labels={ labels }
						onFolderSelect={ (selectedFolder) => this.setState({ selectedFolder }) }
						browseContextDocumentId={ browseContextDocumentId }
					/>
				</ModalBody>

				<ModalFooter>
					<Button type='default' label={ labels.cancelButtonLabel } onClick={ closeModal } />

					<Button
						type='primary'
						label={ labels.submitButtonLabel }
						isDisabled={ selectedFolder === null || selectedFolder.id === null }
						onClick={ () => onModalSubmit(selectedFolder) }
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

FxSelectFolderBrowserModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	onModalSubmit: PropTypes.func.isRequired,
	browseContextDocumentId: PropTypes.string
};

FxSelectFolderBrowserModal.defaultProps = {
	browseContextDocumentId: null
};

export default FxSelectFolderBrowserModal;
