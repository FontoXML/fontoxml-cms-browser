import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

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
	TextInput,
} from 'fontoxml-design-system/src/components';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';

import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities';

function getSubmitModalData(itemToSubmit) {
	return {
		selectedDocumentTemplateId:
			itemToSubmit.selectedDocumentTemplate.remoteDocumentId,
		selectedFolderId: itemToSubmit.selectedFolder.id,
		documentTitle: itemToSubmit.documentTitle,
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(
		selectedItem.documentTitle.trim().length > 0 &&
		selectedItem.selectedFolder.id &&
		selectedItem.selectedDocumentTemplate.remoteDocumentId
	);
}

type Props = ModalProps<{
	insertOperationName?: string;
	isCancelable?: boolean;
}> & {
	modalIcon?: string;
	modalTitle: string;
	onSelectDocumentTemplateClick(...args: unknown[]): unknown;
	onSelectFolderClick(...args: unknown[]): unknown;
	renderModalBodyToolbar?(...args: unknown[]): unknown;
	selectedDocumentTemplate?: object;
	selectedFolder?: object;
};

const DEFAULT_SELECTED_DOCUMENT_TEMPLATE = {};
const DEFAULT_SELECTED_FOLDER = {};

const CreateDocumentFormModalInternal: FC<Props> = ({
	cancelModal,
	data,
	determineAndHandleSubmitButtonDisabledState,
	isSubmitButtonDisabled,
	modalIcon,
	modalTitle,
	onSelectDocumentTemplateClick,
	onSelectFolderClick,
	renderModalBodyToolbar,
	selectedDocumentTemplate = DEFAULT_SELECTED_DOCUMENT_TEMPLATE,
	selectedFolder = DEFAULT_SELECTED_FOLDER,
	submitModal,
}) => {
	const [documentTitle, setDocumentTitle] = useState('');

	useEffect(() => {
		determineAndHandleSubmitButtonDisabledState({
			selectedDocumentTemplate,
			selectedFolder,
			documentTitle,
		});
	}, [
		determineAndHandleSubmitButtonDisabledState,
		documentTitle,
		selectedDocumentTemplate,
		selectedFolder,
	]);

	const handleSubmitButtonClick = useCallback(() => {
		submitModal(
			getSubmitModalData({
				selectedDocumentTemplate,
				selectedFolder,
				documentTitle,
			})
		);
	}, [documentTitle, selectedDocumentTemplate, selectedFolder, submitModal]);

	const handleKeyDown = useCallback(
		(event) => {
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
		[
			cancelModal,
			data.isCancelable,
			handleSubmitButtonClick,
			isSubmitButtonDisabled,
		]
	);

	const handleDocumentTitleChange = useCallback((documentTitle) => {
		setDocumentTitle(documentTitle);
	}, []);

	return (
		<Modal size="s" onKeyDown={handleKeyDown}>
			<ModalHeader
				icon={modalIcon}
				title={modalTitle}
				hideCloseButton={!data.isCancelable}
			/>

			<ModalBody>
				{renderModalBodyToolbar && renderModalBodyToolbar()}

				<ModalContent flexDirection="column" paddingSize="m">
					<Form labelPosition="above">
						<FormRow label={t('Template to start with')}>
							<ButtonWithValue
								buttonLabel={t('Select a template')}
								onClick={onSelectDocumentTemplateClick}
								valueLabel={
									selectedDocumentTemplate.label || null
								}
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
								onChange={handleDocumentTitleChange}
							/>
						</FormRow>
					</Form>
				</ModalContent>
			</ModalBody>

			<ModalFooter>
				{data.isCancelable && (
					<Button
						type="default"
						label={t('Cancel')}
						onClick={cancelModal}
					/>
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

const CreateDocumentFormModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(CreateDocumentFormModalInternal);

export default CreateDocumentFormModal;
