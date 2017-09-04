import React, { PureComponent } from 'react';

import { SelectFileButton } from 'fontoxml-vendor-fds/components';

import dataProviders from './dataProviders';
import refreshItems from './refreshItems.jsx';

class ModalBrowserUploadButton extends PureComponent {
	dataProvider = dataProviders.get(this.props.data.dataProviderName);
	uploadOptions = this.dataProvider.getUploadOptions();

	handleOnSelect = selectedFiles => {
		const { breadcrumbItems, labels, onItemSelect, onUpdateRequest } = this.props;
		const lastLoadedFolder = breadcrumbItems[breadcrumbItems.length - 1];

		// TODO: support multiple
		if (selectedFiles[0].size > this.uploadOptions.maxFileSizeInBytes) {
			onUpdateRequest({
				type: 'upload',
				error: labels.upload.fileSizeTooLargeMessage
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
				return refreshItems(this.props, folderWithUploadedFile, true).then(() =>
					onItemSelect({ ...uploadedItem, value: uploadedItem.id })
				);
			},
			error => {
				if (!error) {
					return;
				}

				onUpdateRequest({
					type: 'upload',
					error: labels.upload.serverErrorMessage
				});
			}
		);
	};

	render() {
		const { breadcrumbItems, labels, request } = this.props;

		const isUploading = request.type === 'upload' && request.busy;
		const isLoading = isUploading || (request.type === 'browse' && request.busy);

		const lastLoadedFolder =
			breadcrumbItems.length > 0 ? breadcrumbItems[breadcrumbItems.length - 1] : null;

		return (
			<SelectFileButton
				label={labels.upload.buttonLabel}
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
