import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

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
import { useHasChanged } from 'fds/system';

import t from 'fontoxml-localization/src/t.js';

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

let CreateDocumentFormModal = ({
	cancelModal,
	data,
	determineAndHandleSubmitButtonDisabledState,
	isSubmitButtonDisabled,
	modalIcon,
	modalTitle,
	onSelectDocumentTemplateClick,
	onSelectFolderClick,
	renderModalBodyToolbar,
	selectedDocumentTemplate,
	selectedFolder,
	submitModal
}) => {
	const [documentTitle, setDocumentTitle] = useState('');

	const documentTitleHasChanged = useHasChanged(documentTitle);
	const selectedDocumentTemplateHasChanged = useHasChanged(selectedDocumentTemplate);
	const selectedFolderHasChanged = useHasChanged(selectedFolder);
	useEffect(() => {
		if (
			documentTitleHasChanged ||
			selectedDocumentTemplateHasChanged ||
			selectedFolderHasChanged
		) {
			determineAndHandleSubmitButtonDisabledState({
				selectedDocumentTemplate: selectedDocumentTemplate,
				selectedFolder: selectedFolder,
				documentTitle
			});
		}
	}, [
		determineAndHandleSubmitButtonDisabledState,
		documentTitle,
		documentTitleHasChanged,
		selectedDocumentTemplate,
		selectedDocumentTemplateHasChanged,
		selectedFolder,
		selectedFolderHasChanged
	]);

	const handleSubmitButtonClick = useCallback(
		() =>
			submitModal(
				getSubmitModalData({
					selectedDocumentTemplate: selectedDocumentTemplate,
					selectedFolder: selectedFolder,
					documentTitle
				})
			),
		[documentTitle, selectedDocumentTemplate, selectedFolder, submitModal]
	);

	const handleKeyDown = useCallback(
		event => {
			switch (event.key) {
				case 'Escape':
					if (data.isCancelable) {
						cancelModal();
					}
					break;
				case 'Enter':
					if (!isSubmitButtonDisabled) {
						handleSubmitButtonClick();
					}
					break;
			}
		},
		[cancelModal, data.isCancelable, handleSubmitButtonClick, isSubmitButtonDisabled]
	);

	const handleDocumentTitleChange = useCallback(
		documentTitle => setDocumentTitle(documentTitle),
		[]
	);

	return (
		<Modal size="s" onKeyDown={handleKeyDown}>
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
							<TextInput value={documentTitle} onChange={handleDocumentTitleChange} />
						</FormRow>
					</Form>
				</ModalContent>
			</ModalBody>

			<ModalFooter>
				{data.isCancelable && (
					<Button type="default" label={t('Cancel')} onClick={cancelModal} />
				)}

				<Button
					type="primary"
					label={t('Create')}
					isDisabled={isSubmitButtonDisabled}
					onClick={handleSubmitButtonClick}
				/>
			</ModalFooter>
		</Modal>
	);
};

CreateDocumentFormModal.defaultProps = {
	renderModalBodyToolbar: null,
	selectedDocumentTemplate: {},
	selectedFolder: {}
};

CreateDocumentFormModal.propTypes = {
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

CreateDocumentFormModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(CreateDocumentFormModal);

export default CreateDocumentFormModal;
