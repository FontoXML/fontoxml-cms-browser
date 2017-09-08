import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

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
} from 'fontoxml-vendor-fds/components';

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

	handleDocumentTitleChange = documentTitle => this.setState({ documentTitle });

	handleSubmitButton = () =>
		this.props.submitModal({
			selectedDocumentTemplateId: this.props.selectedDocumentTemplate.id,
			selectedFolderId: this.props.selectedFolder.id,
			documentTitle: this.state.documentTitle
		});

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
			<Modal size="s">
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
							documentTitle.trim().length < 0 ||
							!selectedFolder.id ||
							!selectedDocumentTemplate.id
						}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default CreateDocumentFormModal;
