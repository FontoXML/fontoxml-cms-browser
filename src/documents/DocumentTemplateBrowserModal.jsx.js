import PropTypes from 'prop-types';
import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader
} from 'fontoxml-vendor-fds/components';

import DocumentGridItem from './DocumentGridItem.jsx';
import DocumentListItem from './DocumentListItem.jsx';
import DocumentModalPreview from './DocumentModalPreview.jsx';
import DocumentLoader from './DocumentLoader.jsx';
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES
} from '../shared/ModalBrowserListOrGridViewMode.jsx';
import refreshItems from '../refreshItems.jsx';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities.jsx';

const stateLabels = {
	loading: {
		title: t('Loading templates…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: null
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain files that can be opened with FontoXML.')
	},
	loadingPreview: {
		title: t('Loading template preview…'),
		message: null
	},
	previewError: {
		title: t('Can’t open this template'),
		message: t(
			'FontoXML can’t open this template. You can try again, or try a different template.'
		)
	}
};

class DocumentTemplateBrowserModal extends Component {
	static defaultProps = {
		remoteDocumentId: null
	};

	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string
		}).isRequired,
		remoteDocumentId: PropTypes.string,
		submitModal: PropTypes.func.isRequired
	};

	handleRenderListItem = ({
		key,
		item,
		isSelected,
		isDisabled,
		onClick,
		onDoubleClick,
		onRef
	}) => (
		<DocumentListItem
			{...this.props}
			key={key}
			item={item.icon || item.type === 'folder' ? item : { ...item, icon: 'file-o' }}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, item, isSelected, isDisabled, onClick, onDoubleClick }) => (
		<DocumentGridItem
			{...this.props}
			key={key}
			item={item.icon || item.type === 'folder' ? item : { ...item, icon: 'file-o' }}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	submitModal = itemToSubmit => this.props.submitModal(itemToSubmit);

	handleFileAndFolderResultListItemSubmit = selectedItem => this.submitModal(selectedItem);

	handleSubmitButtonClick = () => this.submitModal(this.props.selectedItem);

	render() {
		const {
			breadcrumbItems,
			cancelModal,
			data: {
				browseContextDocumentId,
				dataProviderName,
				modalPrimaryButtonLabel,
				modalTitle
			},
			onUpdateViewMode,
			selectedItem,
			viewMode
		} = this.props;
		const hasBreadcrumbItems = breadcrumbItems.length > 0;

		return (
			<Modal size="m">
				<ModalHeader title={modalTitle || t('Select a template')} />

				<ModalBody>
					<ModalContent flexDirection="column">
						<ModalContentToolbar
							justifyContent={hasBreadcrumbItems ? 'space-between' : 'flex-end'}
						>
							{hasBreadcrumbItems && (
								<ModalBrowserHierarchyBreadcrumbs
									{...this.props}
									browseContextDocumentId={browseContextDocumentId}
									dataProviderName={dataProviderName}
								/>
							)}

							<ModalBrowserListOrGridViewMode
								onUpdateViewMode={onUpdateViewMode}
								viewMode={viewMode}
							/>
						</ModalContentToolbar>

						<ModalContent flexDirection="row">
							<ModalContent flexDirection="column">
								<ModalBrowserFileAndFolderResultList
									{...this.props}
									browseContextDocumentId={browseContextDocumentId}
									dataProviderName={dataProviderName}
									onItemSubmit={this.handleFileAndFolderResultListItemSubmit}
									renderListItem={this.handleRenderListItem}
									renderGridItem={this.handleRenderGridItem}
									stateLabels={stateLabels}
								/>
							</ModalContent>

							{selectedItem &&
							selectedItem.type !== 'folder' && (
								<ModalContent flexDirection="column" isScrollContainer>
									<DocumentModalPreview
										{...this.props}
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
						label={modalPrimaryButtonLabel || t('Select')}
						isDisabled={!selectedItem}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const { onUpdateInitialSelectedItemId, remoteDocumentId } = this.props;
		if (remoteDocumentId) {
			onUpdateInitialSelectedItemId(remoteDocumentId);
		}

		refreshItems(
			this.props.breadcrumbItems,
			this.props.data.browseContextDocumentId,
			this.props.data.dataProviderName,
			{ id: null },
			remoteDocumentId,
			this.props.onItemSelect,
			onUpdateInitialSelectedItemId,
			this.props.onUpdateItems,
			this.props.onUpdateRequest,
			this.props.selectedItem
		);
	}
}

DocumentTemplateBrowserModal = withModularBrowserCapabilities(
	DocumentTemplateBrowserModal,
	DocumentLoader,
	VIEWMODES.LIST
);

export default DocumentTemplateBrowserModal;
