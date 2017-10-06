import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader
} from 'fds/components';
import documentsManager from 'fontoxml-documents/documentsManager';
import FxDocumentLoader from 'fontoxml-fx/FxDocumentLoader.jsx';
import t from 'fontoxml-localization/t';

import DocumentGridItem from './DocumentGridItem.jsx';
import DocumentListItem from './DocumentListItem.jsx';
import DocumentPreview from './DocumentPreview.jsx';
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES
} from '../shared/ModalBrowserListOrGridViewMode.jsx';
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
	static defaultProps = {
		renderModalBodyToolbar: null
	};

	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			documentId: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string
		}).isRequired,
		renderModalBodyToolbar: PropTypes.func,
		submitModal: PropTypes.func.isRequired
	};

	submitModal = itemToSubmit =>
		this.props.submitModal({
			remoteDocumentId: itemToSubmit.id,
			documentId: itemToSubmit.documentId
		});

	handleKeyDown = event => {
		const { selectedItem } = this.props;
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (selectedItem && selectedItem.documentId) {
					this.submitModal(selectedItem);
				}
				break;
		}
	};

	handleRenderListItem = ({
		key,
		isDisabled,
		isSelected,
		item,
		onClick,
		onDoubleClick,
		onRef
	}) => (
		<DocumentListItem
			key={key}
			isDisabled={isDisabled}
			isItemErrored={this.props.isItemErrored}
			isSelected={isSelected}
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, isDisabled, isSelected, item, onClick, onDoubleClick }) => (
		<DocumentGridItem
			key={key}
			isDisabled={isDisabled}
			isItemErrored={this.props.isItemErrored}
			isSelected={isSelected}
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleFileAndFolderResultListItemSubmit = selectedItem => {
		this.props.loadItem(selectedItem.id).then(
			documentId =>
				this.props.selectedItem.id === selectedItem.id &&
				this.submitModal({ ...selectedItem, documentId }),
			_error => {
				return;
			}
		);
	};

	handleSubmitButtonClick = () => this.submitModal(this.props.selectedItem);

	render() {
		const {
			cancelModal,
			data: { browseContextDocumentId, modalPrimaryButtonLabel, modalTitle },
			hierarchyItems,
			items,
			loadItem,
			onItemSelect,
			onViewModeChange,
			refreshItems,
			renderModalBodyToolbar,
			request,
			selectedItem,
			viewMode
		} = this.props;
		const hasHierarchyItems = hierarchyItems.length > 0;

		return (
			<Modal size="m" isFullHeight onKeyDown={this.handleKeyDown}>
				<ModalHeader title={modalTitle || t('Select a document')} />

				<ModalBody>
					{renderModalBodyToolbar !== null && renderModalBodyToolbar()}

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

							<ModalBrowserListOrGridViewMode
								onViewModeChange={onViewModeChange}
								viewMode={viewMode}
							/>
						</ModalContentToolbar>

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

							{selectedItem &&
								selectedItem.type !== 'folder' && (
									<ModalContent flexDirection="column">
										<DocumentPreview
											loadItem={loadItem}
											onItemSelect={onItemSelect}
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
						isDisabled={!selectedItem || !selectedItem.documentId}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const {
			data: { browseContextDocumentId, documentId },
			onInitialSelectedItemIdChange,
			refreshItems
		} = this.props;

		if (documentId) {
			onInitialSelectedItemIdChange(
				documentsManager.getDocumentFile(documentId).remoteDocumentId
			);
		}

		refreshItems(browseContextDocumentId, { id: null });
	}
}

DocumentBrowserModal = withModularBrowserCapabilities(
	DocumentBrowserModal,
	FxDocumentLoader,
	VIEWMODES.LIST
);

export default DocumentBrowserModal;
