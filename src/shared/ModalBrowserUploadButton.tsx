import * as React from 'react';

import { SelectFileButton } from 'fontoxml-design-system/src/components';
import t from 'fontoxml-localization/src/t';

import dataProviders from '../dataProviders';

type Props = {
	browseContextDocumentId?: string;
	dataProviderName: string;
	uploadErrorMessages: {
		fileSizeTooLargeMessage: string;
		serverErrorMessage: string;
		invalidFileTypeMessage: string;
	};

	// from withModularBrowserCapabilities
	hierarchyItems?: unknown[];
	onUploadFileSelect(...args: unknown[]): unknown;
	request: object;
};

const DEFAULT_HIERARCHY_ITEMS: Props['hierarchyItems'] = [];

const ModalBrowserUploadButton: React.FC<Props> = ({
	browseContextDocumentId = null,
	dataProviderName,
	uploadErrorMessages,
	hierarchyItems = DEFAULT_HIERARCHY_ITEMS,
	onUploadFileSelect,
	request,
}) => {
	const dataProvider = React.useMemo(
		() => dataProviders.get(dataProviderName),
		[dataProviderName]
	);

	const handleSelect = React.useCallback(
		(selectedFiles) =>
			onUploadFileSelect(
				browseContextDocumentId,
				selectedFiles,
				uploadErrorMessages
			),
		[browseContextDocumentId, onUploadFileSelect, uploadErrorMessages]
	);

	const isUploading = request.type === 'upload' && request.busy;
	const isLoading =
		isUploading || (request.type === 'browse' && request.busy);

	const lastLoadedFolder =
		hierarchyItems.length > 0
			? hierarchyItems[hierarchyItems.length - 1]
			: null;

	return (
		<SelectFileButton
			label={t('Upload')}
			isDisabled={isLoading || lastLoadedFolder === null}
			mimeTypesToAccept={
				dataProvider.getUploadOptions().mimeTypesToAccept
			}
			icon="upload"
			iconAfter={isUploading ? 'spinner' : undefined}
			onSelect={handleSelect}
		/>
	);
};

export default ModalBrowserUploadButton;
