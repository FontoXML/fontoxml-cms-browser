import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxFolderBrowser from '../../browsers/folders/FxFolderBrowser.jsx';

class FxSelectFolderBrowserModal extends Component {
	static defaultProps = {
		browseContextDocumentId: null
	};

	static PropTypes = {
		closeModal: PropTypes.func.isRequired,
		onModalSubmit: PropTypes.func.isRequired,
		browseContextDocumentId: PropTypes.string
	};

	state = { selectedFolder: null };

	handleFolderSelect = selectedFolder => this.setState({ selectedFolder });

	handleSubmitButton = () => this.props.onModalSubmit(this.state.selectedFolder);

	render() {
		const { selectedFolder } = this.state;
		const { labels } = this.props;

		return (
			<Modal size="s">
				<ModalHeader title={labels.modalTitle} />

				<ModalBody paddingSize="l">
					<FxFolderBrowser
						dataProviderName={this.props.dataProviderName}
						labels={labels}
						onFolderSelect={this.handleFolderSelect}
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
						isDisabled={selectedFolder === null || selectedFolder.id === null}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxSelectFolderBrowserModal;
