import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Button,
	ButtonWithValue,
	Form,
	FormRow,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	TextInput
} from 'fds/components';
import t from 'fontoxml-localization/t';

class CreateDocumentFormModal extends Component {
	static defaultProps = {
		renderModalBodyToolbar: null,
		selectedDocumentTemplate: {},
		selectedFolder: {}
	};

	static PropTypes = {
		cancelModal: PropTypes.func.isRequired,
		modalTitle: PropTypes.string.isRequired,
		onSelectDocumentTemplateClick: PropTypes.func.isRequired,
		onSelectFolderClick: PropTypes.func.isRequired,
		renderModalBodyToolbar: PropTypes.func,
		selectedDocumentTemplate: PropTypes.object,
		selectedFolder: PropTypes.object,
		submitModal: PropTypes.func.isRequired
	};

	state = { documentTitle: '' };

	handleSubmitButton = () =>
		this.props.submitModal({
			selectedDocumentTemplateId: this.props.selectedDocumentTemplate.remoteDocumentId,
			selectedFolderId: this.props.selectedFolder.id,
			documentTitle: this.state.documentTitle
		});

	handleKeyDown = event => {
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (
					this.state.documentTitle.trim().length > 0 &&
					this.props.selectedFolder.id &&
					this.props.selectedDocumentTemplate.remoteDocumentId
				) {
					this.handleSubmitButton();
				}
				break;
		}
	};

	handleDocumentTitleChange = documentTitle => this.setState({ documentTitle });

	render() {
		const {
			cancelModal,
			modalTitle,
			onSelectDocumentTemplateClick,
			onSelectFolderClick,
			renderModalBodyToolbar,
			selectedDocumentTemplate,
			selectedFolder
		} = this.props;
		const { documentTitle } = this.state;

		return (
			<Modal size="s" onKeyDown={this.handleKeyDown}>
				<ModalHeader title={modalTitle} />

				<ModalBody>
					{renderModalBodyToolbar !== null && renderModalBodyToolbar()}

					<ModalContent flexDirection="column" paddingSize="m">
						<Form labelPosition="above">
							<FormRow label={t('Template to start with')}>
								<ButtonWithValue
									buttonLabel={t('Select a template')}
									onClick={onSelectDocumentTemplateClick}
									valueLabel={selectedDocumentTemplate.label || null}
								/>
							</FormRow>

							<FormRow label={t('Save in')}>
								<ButtonWithValue
									buttonLabel={t('Select a folder')}
									onClick={onSelectFolderClick}
									valueLabel={selectedFolder.label || null}
								/>
							</FormRow>

							<FormRow label={t('Title')}>
								<TextInput
									value={documentTitle}
									onChange={this.handleDocumentTitleChange}
								/>
							</FormRow>
						</Form>
					</ModalContent>
				</ModalBody>

				<ModalFooter>
					<Button type="default" label={t('Cancel')} onClick={cancelModal} />

					<Button
						type="primary"
						label={t('Create')}
						isDisabled={
							documentTitle.trim().length === 0 ||
							!selectedFolder.id ||
							!selectedDocumentTemplate.remoteDocumentId
						}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default CreateDocumentFormModal;
