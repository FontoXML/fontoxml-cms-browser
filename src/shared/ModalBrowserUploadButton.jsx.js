import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import t from 'fontoxml-localization/t';

import { SelectFileButton } from 'fontoxml-vendor-fds/components';

import dataProviders from '../dataProviders';
import refreshItems from '../refreshItems.jsx';

// TODO: inline the actual upload inside withModularBrowserCapabilities
// make this stateless (possibly even obsolete, FDS selectFileButton might be enough)
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

	handleSelect = selectedFiles => {
		const {
			breadcrumbItems,
			onItemSelect,
			onUpdateInitialSelectedItemId,
			onUpdateRequest,
			uploadErrorMessages
		} = this.props;

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

		const folderWithUploadedFile = breadcrumbItems[breadcrumbItems.length - 1];

		this.dataProvider.upload(folderWithUploadedFile.id, selectedFiles).then(
			uploadedItem => {
				return refreshItems(
					breadcrumbItems,
					this.props.browseContextDocumentId,
					this.props.dataProviderName,
					folderWithUploadedFile,
					this.props.initialSelectedItemId,
					onItemSelect,
					onUpdateInitialSelectedItemId,
					this.props.onUpdateItems,
					onUpdateRequest,
					this.props.selectedItem,
					true
				).then((items = []) => {
					onItemSelect(items.find(item => item.id === uploadedItem.id) || null);

					// An other item (that is not a folder) was selected so the initialSelectedItemId is no longer cached
					onUpdateInitialSelectedItemId(null);
				});
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
				onSelect={this.handleSelect}
			/>
		);
	}
}

export default ModalBrowserUploadButton;
