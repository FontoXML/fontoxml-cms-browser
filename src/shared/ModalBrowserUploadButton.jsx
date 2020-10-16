import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import { SelectFileButton } from 'fds/components';
import t from 'fontoxml-localization/src/t.js';

import dataProviders from '../dataProviders.js';

class ModalBrowserUploadButton extends PureComponent {
	static defaultProps = {
		hierarchyItems: [],
		browseContextDocumentId: null
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,
		dataProviderName: PropTypes.string.isRequired,
		uploadErrorMessages: PropTypes.shape({
			fileSizeTooLargeMessage: PropTypes.string.isRequired,
			serverErrorMessage: PropTypes.string.isRequired,
			invalidFileType: PropTypes.string.isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		hierarchyItems: PropTypes.array,
		onUploadFileSelect: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired
	};

	dataProvider = dataProviders.get(this.props.dataProviderName);

	handleSelect = selectedFiles =>
		this.props.onUploadFileSelect(
			this.props.browseContextDocumentId,
			selectedFiles,
			this.props.uploadErrorMessages
		);

	render() {
		const { hierarchyItems, request } = this.props;

		const isUploading = request.type === 'upload' && request.busy;
		const isLoading = isUploading || (request.type === 'browse' && request.busy);

		const lastLoadedFolder =
			hierarchyItems.length > 0 ? hierarchyItems[hierarchyItems.length - 1] : null;

		return (
			<SelectFileButton
				label={t('Upload')}
				isDisabled={isLoading || lastLoadedFolder === null}
				mimeTypesToAccept={this.dataProvider.getUploadOptions().mimeTypesToAccept}
				icon="upload"
				iconAfter={isUploading ? 'spinner' : null}
				onSelect={this.handleSelect}
			/>
		);
	}
}

export default ModalBrowserUploadButton;
