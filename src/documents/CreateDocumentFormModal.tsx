import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
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
import type {
	FdsOnChangeCallback,
	FdsOnClickCallback,
	FdsOnKeyDownCallback,
} from 'fontoxml-design-system/src/types';
import type { ModalProps } from 'fontoxml-fx/src/types';
import useOperation from 'fontoxml-fx/src/useOperation';
import t from 'fontoxml-localization/src/t';

import type { SubmittedModalData as DocumentTemplateBrowserSubmittedModalData } from './DocumentTemplateBrowserModal';
import type { SubmittedModalData as FolderBrowserSubmittedModalData } from './FolderBrowserModal';

type IncomingModalData = {
	insertOperationName?: string;
	isCancelable?: boolean;
	modalIcon?: string;
	modalTitle: string;
	selectedDocumentTemplate?: DocumentTemplateBrowserSubmittedModalData;
	selectedFolder?: FolderBrowserSubmittedModalData;
};
type SubmittedModalData = {
	selectedDocumentTemplateId: BrowseResponseItem['id'];
	selectedFolderId: BrowseResponseItem['id'];
	documentTitle: string;
};

type Props = ModalProps<IncomingModalData, SubmittedModalData> & {
	onSelectDocumentTemplateClick: FdsOnClickCallback;
	onSelectFolderClick: FdsOnClickCallback;
	renderModalBodyToolbar?: () => JSX.Element;
};

const CreateDocumentFormModal: FC<Props> = ({
	cancelModal,
	data,
	onSelectDocumentTemplateClick,
	onSelectFolderClick,
	renderModalBodyToolbar,
	submitModal,
}) => {
	const [documentTitle, setDocumentTitle] = useState('');

	const dataToSubmit = useMemo<SubmittedModalData | undefined>(() => {
		if (
			!data.selectedDocumentTemplate?.remoteDocumentId ||
			// selectedFolderId === null means the root folder is selected,
			// which is valid
			data.selectedFolder?.remoteDocumentId === undefined ||
			!documentTitle
		) {
			return undefined;
		}

		return {
			selectedDocumentTemplateId:
				data.selectedDocumentTemplate.remoteDocumentId,
			selectedFolderId: data.selectedFolder.remoteDocumentId,
			documentTitle: documentTitle.trim(),
		};
	}, [
		data.selectedDocumentTemplate?.remoteDocumentId,
		data.selectedFolder?.remoteDocumentId,
		documentTitle,
	]);

	const operationData = useMemo(
		() => ({ ...data, ...dataToSubmit }),
		[data, dataToSubmit]
	);

	const { operationState } = useOperation(
		data.insertOperationName,
		operationData
	);

	const isSubmitButtonDisabled = useMemo(
		() => !dataToSubmit || !operationState.enabled,
		[dataToSubmit, operationState.enabled]
	);

	const handleKeyDown = useCallback<FdsOnKeyDownCallback>(
		(event) => {
			switch (event.key) {
				case 'Escape':
					if (data.isCancelable) {
						cancelModal();
					}
					break;
				case 'Enter':
					if (!isSubmitButtonDisabled) {
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
						submitModal(dataToSubmit!);
					}
					break;
			}
		},
		[
			cancelModal,
			data.isCancelable,
			dataToSubmit,
			isSubmitButtonDisabled,
			submitModal,
		]
	);

	const handleDocumentTitleChange = useCallback<FdsOnChangeCallback>(
		(documentTitle: string) => {
			setDocumentTitle(documentTitle);
		},
		[]
	);

	const handleSubmitButtonClick = useCallback<FdsOnClickCallback>(() => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		submitModal(dataToSubmit!);
	}, [dataToSubmit, submitModal]);

	return (
		<Modal size="s" onKeyDown={handleKeyDown}>
			<ModalHeader
				icon={data.modalIcon}
				title={data.modalTitle ?? ''}
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
									data.selectedDocumentTemplate?.label
								}
							/>
						</FormRow>

						<FormRow label={t('Save in')}>
							<ButtonWithValue
								buttonLabel={t('Select a folder')}
								onClick={onSelectFolderClick}
								valueLabel={data.selectedFolder?.label}
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

export default CreateDocumentFormModal;
