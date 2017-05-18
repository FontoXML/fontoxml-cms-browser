import PropTypes from 'prop-types';
import React from 'react';

import { ButtonWithValue, Form, FormRow, Inlay, TextInput } from 'fontoxml-vendor-fds/components';

const FxCreateDocumentForm = ({
	documentTitle, onDocumentTitleChange,
	openSelectFolderBrowserModal, openSelectDocumentTemplateBrowserModal,
	selectedFolder, selectedDocumentTemplate,
	labels
}) => (
	<Inlay>
		<Form labelPosition='above'>
			<FormRow label={ labels.selectTemplateFormRowLabel }>
				<ButtonWithValue
					buttonLabel={ labels.selectTemplateButtonLabel }
					onClick={ () => openSelectDocumentTemplateBrowserModal() }
					valueLabel={ selectedDocumentTemplate ? selectedDocumentTemplate.label : null }
				/>
			</FormRow>

			<FormRow label={ labels.selectFolderFormRowLabel }>
				<ButtonWithValue
					buttonLabel={ labels.selectFolderButtonLabel }
					onClick={ () => openSelectFolderBrowserModal() }
					valueLabel={ selectedFolder ? selectedFolder.label : null }
				/>
			</FormRow>

			<FormRow label={ labels.titleFormRowLabel }>
				<TextInput
					value={ documentTitle }
					onChange={ (textInputValue) => onDocumentTitleChange(textInputValue) }
				/>
			</FormRow>
		</Form>
	</Inlay>
);

FxCreateDocumentForm.propTypes = {
	documentTitle: PropTypes.string.isRequired,
	onDocumentTitleChange: PropTypes.func.isRequired,
	openSelectFolderBrowserModal: PropTypes.func.isRequired,
	openSelectDocumentTemplateBrowserModal: PropTypes.func.isRequired
};

export default FxCreateDocumentForm;
