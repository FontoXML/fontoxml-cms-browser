import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import t from 'fontoxml-localization/t';

import { SelectFileButton } from 'fontoxml-vendor-fds/components';

import dataProviders from '../dataProviders';
import refreshItems from '../refreshItems.jsx';

class ModalBrowserUploadButton extends PureComponent {
	static defaultProps = {
		breadcrumbItems: [],
		browseContextDocumentId: null,
		initialSelectedItemId: null,
		selectedItem: null
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,
		dataProviderName: PropTypes.string.isRequired,
		uploadErrorMessages: PropTypes.shape({
			fileSizeTooLargeMessage: PropTypes.string.isRequired,
			serverErrorMessage: PropTypes.string.isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		breadcrumbItems: PropTypes.array,
		initialSelectedItemId: PropTypes.string,
		onItemSelect: PropTypes.func.isRequired,
		onUpdateInitialSelectedItemId: PropTypes.func.isRequired,
		onUpdateItems: PropTypes.func.isRequired,
		onUpdateRequest: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired,
		selectedItem: PropTypes.object
	};

	dataProvider = dataProviders.get(this.props.dataProviderName);
	uploadOptions = this.dataProvider.getUploadOptions();

	handleOnSelect = selectedFiles => {
		const { breadcrumbItems, onItemSelect, onUpdateRequest, uploadErrorMessages } = this.props;
		const lastLoadedFolder = breadcrumbItems[breadcrumbItems.length - 1];

		// TODO: support multiple
		if (selectedFiles[0].size > this.uploadOptions.maxFileSizeInBytes) {
			onUpdateRequest({
				type: 'upload',
				error: uploadErrorMessages.fileSizeTooLargeMessage
			});
			return;
		}

		onUpdateRequest({
			type: 'upload',
			busy: true
		});

		const folderWithUploadedFile = { ...lastLoadedFolder };

		this.dataProvider.upload(folderWithUploadedFile.id, selectedFiles).then(
			uploadedItem => {
				return refreshItems(
					breadcrumbItems,
					this.props.browseContextDocumentId,
					this.props.dataProviderName,
					folderWithUploadedFile,
					this.props.initialSelectedItemId,
					onItemSelect,
					this.props.onUpdateInitialSelectedItemId,
					this.props.onUpdateItems,
					onUpdateRequest,
					this.props.selectedItem,
					true
				).then(() => onItemSelect(uploadedItem));
			},
			error => {
				if (!error) {
					return;
				}

				onUpdateRequest({
					type: 'upload',
					error: uploadErrorMessages.serverErrorMessage
				});
			}
		);
	};

	render() {
		const { breadcrumbItems, request } = this.props;

		const isUploading = request.type === 'upload' && request.busy;
		const isLoading = isUploading || (request.type === 'browse' && request.busy);

		const lastLoadedFolder =
			breadcrumbItems.length > 0 ? breadcrumbItems[breadcrumbItems.length - 1] : null;

		return (
			<SelectFileButton
				label={t('Upload')}
				isDisabled={isLoading || lastLoadedFolder === null || lastLoadedFolder.id === null}
				mimeTypesToAccept={this.uploadOptions.mimeTypesToAccept}
				icon="upload"
				iconAfter={isUploading ? 'spinner' : null}
				onSelect={this.handleOnSelect}
			/>
		);
	}
}

export default ModalBrowserUploadButton;
