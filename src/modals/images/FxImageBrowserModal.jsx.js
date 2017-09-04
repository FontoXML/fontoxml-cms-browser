import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

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
} from 'fontoxml-vendor-fds/components';

import ImageGridItem from './ImageGridItem.jsx';
import ImageListItem from './ImageListItem.jsx';
import ModalBrowserFileAndFolderResultList from '../../ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../../ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	viewModes
} from '../../ModalBrowserListOrGridViewMode.jsx';
import ModalBrowserPreview from '../../ModalBrowserPreview.jsx';
import ModalBrowserUploadButton from '../../ModalBrowserUploadButton.jsx';
import refreshItems, { rootFolder } from '../../refreshItems.jsx';
import withModularBrowserCapabilities from '../../withModularBrowserCapabilities.jsx';

import ImagePreview from './ImagePreview.jsx';

const getLabels = isInEditFlow => ({
	modalTitle: isInEditFlow ? t('Replace image') : t('Add image'),
	states: {
		loading: {
			title: t('Loading images…'),
			message: null
		},
		browseError: {
			title: t('Can’t open this folder'),
			message: t(
				'FontoXML can’t open this folder. You can try again, or try a different folder.'
			)
		},
		empty: {
			title: t('No results'),
			message: t('This folder does not contain images that can be opened with FontoXML.')
		},
		loadingPreview: {
			title: t('Loading image preview…'),
			message: null
		},
		previewError: {
			title: t('Can’t open this image'),
			message: t(
				'FontoXML can’t open this image. You can try again, or try a different image.'
			)
		}
	},
	cancelButtonLabel: t('Cancel'),
	submitButtonLabel: isInEditFlow ? t('Replace') : t('Add'),
	upload: {
		buttonLabel: t('Upload'),
		fileSizeTooLargeMessage: t(
			'This image is larger than 4 megabyte, please select another image or resize it and try again.'
		),
		serverErrorMessage: t('FontoXML can’t upload this image, please try again.')
	}
});

class FxImageBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			selectedImageId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
	};

	labels = getLabels(this.props.data.selectedImageId !== null);

	onSubmit = selectedItem => {
		this.props.submitModal({ selectedImageId: selectedItem.id });
	};

	handleRenderListItem = ({ key, item, isSelected, isDisabled, onRef }) => (
		<ImageListItem
			{...this.props}
			key={key}
			item={item}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={this.props.onItemSelect}
			onDoubleClick={item =>
				item.type === 'folder' ? refreshItems(this.props, item) : this.onSubmit(item)}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, item, isSelected, isDisabled, onClick, onDoubleClick }) => (
		<ImageGridItem
			{...this.props}
			key={key}
			item={item}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleRenderPreview = ({ dataUrl, heading, properties }) => (
		<ImagePreview dataUrl={dataUrl} heading={heading} properties={properties} />
	);

	handleSubmitButtonClick = () => this.onSubmit(this.props.selectedItem);

	render() {
		const { request } = this.props;
		const hasBreadcrumbItems = this.props.breadcrumbItems.length > 0;
		return (
			<Modal size="l" isFullHeight={true}>
				<ModalHeader title={this.labels.modalTitle} />

				<ModalBody>
					<ModalContent flexDirection="column">
						<ModalContentToolbar
							justifyContent={hasBreadcrumbItems ? 'space-between' : 'flex-end'}
						>
							{hasBreadcrumbItems && (
								<ModalBrowserHierarchyBreadcrumbs {...this.props} />
							)}

							<Flex flex="none" spaceSize="m">
								<ModalBrowserUploadButton labels={this.labels} {...this.props} />

								<ModalBrowserListOrGridViewMode {...this.props} />
							</Flex>
						</ModalContentToolbar>
						{request.type === 'upload' &&
						request.error && (
							<ModalContent flex="none" paddingSize="m">
								<Toast
									connotation="error"
									icon="exclamation-triangle"
									content={request.error}
								/>
							</ModalContent>
						)}
						<ModalContent flexDirection="row">
							<ModalContent flexDirection="column" isScrollContainer>
								<ModalBrowserFileAndFolderResultList
									{...this.props}
									labels={this.labels}
									renderListItem={this.handleRenderListItem}
									renderGridItem={this.handleRenderGridItem}
									onSubmit={this.onSubmit}
								/>
							</ModalContent>
							{this.props.selectedItem &&
							this.props.selectedItem.type !== 'folder' && (
								<ModalContent flexDirection="column">
									<ModalBrowserPreview
										{...this.props}
										labels={this.labels}
										renderPreview={this.handleRenderPreview}
									/>
								</ModalContent>
							)}
						</ModalContent>
					</ModalContent>
				</ModalBody>

				<ModalFooter>
					<Button
						type="default"
						label={this.labels.cancelButtonLabel}
						onClick={this.props.cancelModal}
					/>

					<Button
						type="primary"
						label={this.labels.submitButtonLabel}
						isDisabled={this.props.selectedItem === null}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		refreshItems(this.props, rootFolder);
	}
}

FxImageBrowserModal = withModularBrowserCapabilities(FxImageBrowserModal, viewModes[1] /* grid*/);

export default FxImageBrowserModal;
