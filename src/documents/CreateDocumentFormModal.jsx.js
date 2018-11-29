import PropTypes from 'prop-types';
import React, { Component } from 'react';

import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities.jsx';

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

function getSubmitModalData(itemToSubmit) {
	return {
		selectedDocumentTemplateId: itemToSubmit.selectedDocumentTemplate.remoteDocumentId,
		selectedFolderId: itemToSubmit.selectedFolder.id,
		documentTitle: itemToSubmit.documentTitle
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(
		selectedItem.documentTitle.trim().length > 0 &&
		selectedItem.selectedFolder.id &&
		selectedItem.selectedDocumentTemplate.remoteDocumentId
	);
}

class CreateDocumentFormModal extends Component {
	static defaultProps = {
		renderModalBodyToolbar: null,
		selectedDocumentTemplate: {},
		selectedFolder: {}
	};

	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			insertOperationName: PropTypes.string,
			isCancelable: PropTypes.bool
		}),
		modalIcon: PropTypes.string,
		modalTitle: PropTypes.string.isRequired,
		onSelectDocumentTemplateClick: PropTypes.func.isRequired,
		onSelectFolderClick: PropTypes.func.isRequired,
		renderModalBodyToolbar: PropTypes.func,
		selectedDocumentTemplate: PropTypes.object,
		selectedFolder: PropTypes.object,
		submitModal: PropTypes.func.isRequired
	};

	state = { documentTitle: '' };

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.selectedFolder.id !== this.props.selectedFolder.id ||
			nextProps.selectedDocumentTemplate.remoteDocumentId !==
				this.props.selectedDocumentTemplate.remoteDocumentId
		) {
			this.props.determineAndHandleSubmitButtonDisabledState({
				selectedDocumentTemplate: nextProps.selectedDocumentTemplate,
				selectedFolder: nextProps.selectedFolder,
				documentTitle: this.state.documentTitle
			});
		}
	}

	handleSubmitButton = () =>
		this.props.submitModal(
			getSubmitModalData({
				selectedDocumentTemplate: this.props.selectedDocumentTemplate,
				selectedFolder: this.props.selectedFolder,
				documentTitle: this.state.documentTitle
			})
		);

	handleKeyDown = event => {
		switch (event.key) {
			case 'Escape':
				if (this.props.data.isCancelable) {
					this.props.cancelModal();
				}
				break;
			case 'Enter':
				if (!this.props.isSubmitButtonDisabled) {
					this.handleSubmitButton();
				}
				break;
		}
	};

	handleDocumentTitleChange = documentTitle => {
		this.setState({ documentTitle });

		this.props.determineAndHandleSubmitButtonDisabledState({
			selectedDocumentTemplate: this.props.selectedDocumentTemplate,
			selectedFolder: this.props.selectedFolder,
			documentTitle
		});
	};

	render() {
		const {
			cancelModal,
			data: { isCancelable },
			isSubmitButtonDisabled,
			modalIcon,
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
				<ModalHeader icon={modalIcon} title={modalTitle} />

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
					{isCancelable && (
						<Button type="default" label={t('Cancel')} onClick={cancelModal} />
					)}

					<Button
						type="primary"
						label={t('Create')}
						isDisabled={isSubmitButtonDisabled}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

CreateDocumentFormModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(CreateDocumentFormModal);

export default CreateDocumentFormModal;
