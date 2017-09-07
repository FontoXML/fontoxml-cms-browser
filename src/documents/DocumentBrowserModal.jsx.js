import PropTypes from 'prop-types';
import React, { Component } from 'react';

import documentsManager from 'fontoxml-documents/documentsManager';
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
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	viewModes
} from '../shared/ModalBrowserListOrGridViewMode.jsx';
import refreshItems from '../refreshItems.jsx';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities.jsx';

const stateLabels = {
	loading: {
		title: t('Loading documents…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t('FontoXML can’t open this folder. You can try again, or try a different folder.')
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain files that can be opened with FontoXML.')
	},
	loadingPreview: {
		title: t('Loading document preview…'),
		message: null
	},
	previewError: {
		title: t('Can’t open this document'),
		message: t(
			'FontoXML can’t open this document. You can try again, or try a different document.'
		)
	}
};

class DocumentBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			documentId: PropTypes.string,
			modalTitle: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string
		}).isRequired,
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
			item={item}
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
			item={item}
			isSelected={isSelected}
			isDisabled={isDisabled}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	submitModal = itemToSubmit =>
		this.props.submitModal({
			documentRemoteId: itemToSubmit.id,
			documentId: itemToSubmit.documentId
		});

	handleFileAndFolderResultListItemSubmit = selectedItem => {
		this.props.loadDocument(selectedItem.id).then(
			documentId => this.submitModal({ ...selectedItem, documentId }),
			_error => {
				return;
			}
		);
	};

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
			<Modal size="m" isFullHeight={true}>
				<ModalHeader title={modalTitle || t('Select a document')} />

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
						label={modalPrimaryButtonLabel || t('Insert')}
						isDisabled={!selectedItem || !selectedItem.documentId}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const { data: { documentId }, onUpdateInitialSelectedFileId } = this.props;
		let remoteDocumentId = null;
		if (documentId) {
			remoteDocumentId = documentsManager.getDocumentFile(documentId).remoteDocumentId;
			onUpdateInitialSelectedFileId(remoteDocumentId);
		}

		refreshItems(
			this.props.breadcrumbItems,
			this.props.data.browseContextDocumentId,
			this.props.data.dataProviderName,
			{ id: null },
			remoteDocumentId,
			this.props.onItemSelect,
			onUpdateInitialSelectedFileId,
			this.props.onUpdateItems,
			this.props.onUpdateRequest,
			this.props.selectedItem
		);
	}
}

DocumentBrowserModal = withModularBrowserCapabilities(DocumentBrowserModal, viewModes[0] /* list*/);

export default DocumentBrowserModal;
