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
import t from 'fontoxml-localization/t';

import DocumentGridItem from './DocumentGridItem.jsx';
import DocumentListItem from './DocumentListItem.jsx';
import DocumentPreview from './DocumentPreview.jsx';
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList.jsx';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs.jsx';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES
} from '../shared/ModalBrowserListOrGridViewMode.jsx';
import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities.jsx';
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

function getSubmitModalData(itemToSubmit) {
	return {
		remoteDocumentId: itemToSubmit.id,
		documentId: itemToSubmit.documentId
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.documentId);
}

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
			insertOperationName: PropTypes.string,
			modalIcon: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string
		}).isRequired,
		renderModalBodyToolbar: PropTypes.func,
		submitModal: PropTypes.func.isRequired
	};

	handleKeyDown = event => {
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (!this.props.isSubmitButtonDisabled) {
					this.props.submitModal(getSubmitModalData(this.props.selectedItem));
				}
				break;
		}
	};

	// Because we need to add the documentId for submit, we override the double click functionallity
	handleItemDoubleClick = item => {
		if (item.type === 'folder') {
			this.props.refreshItems(this.props.browseContextDocumentId, item);
		} else if (item.documentId) {
			this.props.determineAndHandleItemSubmitForSelectedItem(item);
		}
	};

	handleRenderListItem = ({ key, isDisabled, isSelected, item, onClick, onRef }) => (
		<DocumentListItem
			key={key}
			isDisabled={isDisabled}
			isSelected={isSelected}
			item={item}
			onClick={onClick}
			onDoubleClick={this.handleItemDoubleClick}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, isDisabled, isSelected, item, onClick }) => (
		<DocumentGridItem
			key={key}
			isDisabled={isDisabled}
			isSelected={isSelected}
			item={item}
			onClick={onClick}
			onDoubleClick={this.handleItemDoubleClick}
		/>
	);

	// Because the documentId is needed by submit, we need to add this to the selectedItem when the
	// preview is done loading
	handleLoadIsDone = documentId =>
		this.props.onItemSelect({ ...this.props.selectedItem, documentId });

	handleSubmitButtonClick = () =>
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));

	render() {
		const {
			cancelModal,
			data: { browseContextDocumentId, modalIcon, modalPrimaryButtonLabel, modalTitle },
			hierarchyItems,
			isSubmitButtonDisabled,
			items,
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
				<ModalHeader icon={modalIcon} title={modalTitle || t('Select a document')} />

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
											onLoadIsDone={this.handleLoadIsDone}
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
			data: { browseContextDocumentId, documentId },
			onInitialSelectedItemIdChange,
			refreshItems
		} = this.props;

		if (documentId) {
			onInitialSelectedItemIdChange({
				id: documentsManager.getDocumentFile(documentId).remoteDocumentId
			});
		}

		refreshItems(browseContextDocumentId, { id: null });
	}
}

DocumentBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(DocumentBrowserModal);
DocumentBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentBrowserModal);

export default DocumentBrowserModal;
