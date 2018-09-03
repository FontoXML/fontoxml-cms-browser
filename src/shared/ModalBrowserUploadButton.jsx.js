import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import { SelectFileButton } from 'fds/components';
import t from 'fontoxml-localization/t';

import dataProviders from '../dataProviders';

const disabledReasonOnSearch = t('Upload is disabled while searching.');

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
			serverErrorMessage: PropTypes.string.isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		hierarchyItems: PropTypes.array,
		onUploadFileSelect: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired,
		searchParameters: PropTypes.object
	};

	dataProvider = dataProviders.get(this.props.dataProviderName);

	handleSelect = selectedFiles =>
		this.props.onUploadFileSelect(
			this.props.browseContextDocumentId,
			selectedFiles,
			this.props.uploadErrorMessages
		);

	render() {
		const { hierarchyItems, request, searchParameters } = this.props;

		const isUploading = request.type === 'upload' && request.busy;
		const isLoading =
			isUploading ||
			((request.type === 'browse' || request.type === 'search') && request.busy);

		const lastLoadedFolder =
			hierarchyItems.length > 0 ? hierarchyItems[hierarchyItems.length - 1] : null;

		const isSearching = !!searchParameters;

		return (
			<SelectFileButton
				label={t('Upload')}
				isDisabled={isLoading || lastLoadedFolder === null || isSearching}
				tooltipContent={isSearching && disabledReasonOnSearch}
				mimeTypesToAccept={this.dataProvider.getUploadOptions().mimeTypesToAccept}
				icon="upload"
				iconAfter={isUploading ? 'spinner' : null}
				onSelect={this.handleSelect}
			/>
		);
	}
}

export default ModalBrowserUploadButton;
