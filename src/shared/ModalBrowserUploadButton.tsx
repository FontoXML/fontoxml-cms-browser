import { SelectFileButton } from 'fds/components';
import React, { PureComponent } from 'react';

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

class ModalBrowserUploadButton extends PureComponent<Props> {
	static defaultProps = {
		hierarchyItems: [],
		browseContextDocumentId: null,
	};

	dataProvider = dataProviders.get(this.props.dataProviderName);

	handleSelect = (selectedFiles) =>
		this.props.onUploadFileSelect(
			this.props.browseContextDocumentId,
			selectedFiles,
			this.props.uploadErrorMessages
		);

	render() {
		const { hierarchyItems, request } = this.props;

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
					this.dataProvider.getUploadOptions().mimeTypesToAccept
				}
				icon="upload"
				iconAfter={isUploading ? 'spinner' : null}
				onSelect={this.handleSelect}
			/>
		);
	}
}

export default ModalBrowserUploadButton;
