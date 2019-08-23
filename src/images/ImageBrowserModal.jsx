import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Button,
	Flex,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
	Toast
} from 'fds/components';

import configurationManager from 'fontoxml-configuration/src/configurationManager.js';
import t from 'fontoxml-localization/src/t.js';

import ImageGridItem from './ImageGridItem.jsx';
import ImageListItem from './ImageListItem.jsx';
import ImagePreview from './ImagePreview.jsx';
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES
} from '../shared/ModalBrowserListOrGridViewMode.jsx';
import ModalBrowserUploadButton from '../shared/ModalBrowserUploadButton.jsx';
import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities.jsx';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities.jsx';

const cmsBrowserSendsHierarchyItemsInBrowseResponse = configurationManager.get(
	'cms-browser-sends-hierarchy-items-in-browse-response'
);

const cmsBrowserUploadMaxFileSizeInBytes = configurationManager.get(
	'cms-browser-upload-max-file-size-in-bytes'
);

const stateLabels = {
	loading: {
		title: t('Loading images…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t('Fonto can’t open this folder. You can try again, or try a different folder.')
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain images that can be opened with Fonto.')
	},
	loadingPreview: {
		title: t('Loading image preview…'),
		message: null
	},
	previewError: {
		title: t('Can’t open this image'),
		message: t('Fonto can’t open this image. You can try again, or try a different image.')
	}
};

const uploadErrorMessages = {
	fileSizeTooLargeMessage: t(
		'This image is larger than {MAX_IMAGE_UPLOAD_SIZE} megabyte, please select another image or resize it and try again.',
		{
			MAX_IMAGE_UPLOAD_SIZE:
				Math.round((cmsBrowserUploadMaxFileSizeInBytes / 1000000) * 100) / 100
		}
	),
	serverErrorMessage: t('Fonto can’t upload this image, please try again.')
};

function getSubmitModalData(itemToSubmit) {
	return {
		selectedImageId: itemToSubmit.id
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.type !== 'folder');
}

class ImageBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			insertOperationName: PropTypes.string,
			modalIcon: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string,
			selectedImageId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	handleKeyDown = event => {
		const { selectedItem } = this.props;
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (!this.props.isSubmitButtonDisabled) {
					this.props.submitModal(getSubmitModalData(selectedItem));
				}
				break;
		}
	};

	handleFileAndFolderResultListItemSubmit = selectedItem =>
		this.props.determineAndHandleItemSubmitForSelectedItem(selectedItem);

	handleRenderListItem = ({ key, item, onClick, onDoubleClick, onRef }) => (
		<ImageListItem
			key={key}
			isDisabled={item.isDisabled}
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, item, onClick, onDoubleClick }) => (
		<ImageGridItem
			key={key}
			isDisabled={item.isDisabled}
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleSubmitButtonClick = () =>
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));

	render() {
		const {
			cancelModal,
			data: {
				browseContextDocumentId,
				dataProviderName,
				modalIcon,
				modalPrimaryButtonLabel,
				modalTitle
			},
			hierarchyItems,
			isSubmitButtonDisabled,
			items,
			onItemSelect,
			onUploadFileSelect,
			onViewModeChange,
			refreshItems,
			request,
			selectedItem,
			viewMode
		} = this.props;
		const hasHierarchyItems = hierarchyItems.length > 0;

		return (
			<Modal size="l" isFullHeight onKeyDown={this.handleKeyDown}>
				<ModalHeader icon={modalIcon} title={modalTitle || t('Select an image')} />

				<ModalBody>
					<ModalContent flexDirection="column">
						<ModalContentToolbar
							justifyContent={hasHierarchyItems ? 'space-between' : 'flex-end'}
						>
							{hasHierarchyItems && (
								<ModalBrowserHierarchyBreadcrumbs
									browseContextDocumentId={browseContextDocumentId}
									hierarchyItems={hierarchyItems}
									refreshItems={refreshItems}
									request={request}
								/>
							)}

							<Flex flex="none" spaceSize="m">
								<ModalBrowserUploadButton
									browseContextDocumentId={browseContextDocumentId}
									dataProviderName={dataProviderName}
									hierarchyItems={hierarchyItems}
									request={request}
									uploadErrorMessages={uploadErrorMessages}
									onUploadFileSelect={onUploadFileSelect}
								/>

								<ModalBrowserListOrGridViewMode
									onViewModeChange={onViewModeChange}
									viewMode={viewMode}
								/>
							</Flex>
						</ModalContentToolbar>

						{request.type === 'upload' && request.error && (
							<ModalContent flex="none" paddingSize="m">
								<Toast
									connotation="error"
									icon="exclamation-triangle"
									content={request.error}
								/>
							</ModalContent>
						)}

						<ModalContent flexDirection="row">
							<ModalContent flexDirection="column">
								<ModalBrowserFileAndFolderResultList
									browseContextDocumentId={browseContextDocumentId}
									items={items}
									onItemSelect={onItemSelect}
									onItemSubmit={this.handleFileAndFolderResultListItemSubmit}
									refreshItems={refreshItems}
									renderListItem={this.handleRenderListItem}
									renderGridItem={this.handleRenderGridItem}
									request={request}
									selectedItem={selectedItem}
									stateLabels={stateLabels}
									viewMode={viewMode}
								/>
							</ModalContent>

							{selectedItem && selectedItem.type !== 'folder' && (
								<ModalContent flexDirection="column">
									<ImagePreview
										selectedItem={selectedItem}
										stateLabels={stateLabels}
									/>
								</ModalContent>
							)}
						</ModalContent>
					</ModalContent>
				</ModalBody>

				<ModalFooter>
					<Button type="default" label={t('Cancel')} onClick={cancelModal} />

					<Button
						type="primary"
						label={modalPrimaryButtonLabel || t('Insert')}
						isDisabled={isSubmitButtonDisabled}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const {
			data: { browseContextDocumentId, selectedImageId },
			lastOpenedState,
			onInitialSelectedItemIdChange,
			refreshItems
		} = this.props;

		const { hierarchyItems } = lastOpenedState;

		const initialSelectedItem = selectedImageId ? { id: selectedImageId } : null;
		if (cmsBrowserSendsHierarchyItemsInBrowseResponse && initialSelectedItem) {
			onInitialSelectedItemIdChange(initialSelectedItem);
			refreshItems(browseContextDocumentId, { id: null });
		} else if (hierarchyItems && hierarchyItems.length > 1) {
			refreshItems(
				browseContextDocumentId,
				hierarchyItems[hierarchyItems.length - 1],
				false,
				hierarchyItems
			);
		} else {
			refreshItems(browseContextDocumentId, { id: null });
		}
	}
}

ImageBrowserModal = withModularBrowserCapabilities(VIEWMODES.GRID)(ImageBrowserModal);
ImageBrowserModal = withInsertOperationNameCapabilities(getSubmitModalData, canSubmitSelectedItem)(
	ImageBrowserModal
);

export default ImageBrowserModal;
