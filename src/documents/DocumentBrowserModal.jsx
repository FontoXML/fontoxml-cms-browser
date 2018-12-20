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
import documentsManager from 'fontoxml-documents/src/documentsManager.js';

import configurationManager from 'fontoxml-configuration/src/configurationManager.js';
import t from 'fontoxml-localization/src/t.js';

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

let cmsBrowserSendsHierarchyItemsInBrowseResponse = configurationManager.get(
	'cms-browser-sends-hierarchy-items-in-browse-response'
);

const stateLabels = {
	loading: {
		title: t('Loading documents…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t('Fonto can’t open this folder. You can try again, or try a different folder.')
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain files that can be opened with Fonto.')
	},
	loadingPreview: {
		title: t('Loading document preview…'),
		message: null
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
			isCancelable: PropTypes.bool,
			modalIcon: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string
		}).isRequired,
		renderModalBodyToolbar: PropTypes.func,
		submitModal: PropTypes.func.isRequired
	};

	doubleClickedItemId = null;

	componentWillReceiveProps(nextProps) {
		if (
			this.doubleClickedItemId !== null &&
			(nextProps.selectedItem === null ||
				this.doubleClickedItemId !== nextProps.selectedItem.id)
		) {
			this.doubleClickedItemId = null;
		}
	}

	handleKeyDown = event => {
		switch (event.key) {
			case 'Escape':
				if (this.props.data.isCancelable) {
					this.props.cancelModal();
				}
				break;
			case 'Enter':
				if (!this.props.isSubmitButtonDisabled) {
					this.props.submitModal(getSubmitModalData(this.props.selectedItem));
				}
				break;
		}
	};

	// Because we need to override the double click, because we need to add the documentId for submit.
	// This will be done right away if the selectedItem already has the documentId, else we have to wait
	// until the document is loaded in the preview.
	handleItemDoubleClick = item => {
		const { selectedItem } = this.props;

		if (item.type === 'folder') {
			this.props.refreshItems(this.props.browseContextDocumentId, item);
		} else if (selectedItem.id === item.id && selectedItem.documentId) {
			this.props.determineAndHandleItemSubmitForSelectedItem(selectedItem);
		} else {
			this.doubleClickedItemId = item.id;
		}
	};

	handleRenderListItem = ({ key, item, onClick, onRef }) => (
		<DocumentListItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item}
			onClick={onClick}
			onDoubleClick={() => this.handleItemDoubleClick(item)}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, item, onClick }) => (
		<DocumentGridItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item}
			onClick={onClick}
			onDoubleClick={() => this.handleItemDoubleClick(item)}
		/>
	);

	// Because the documentId is needed by submit, we need to add this to the selectedItem when the
	// preview is done loading. If the item was also double clicked, we want to submit right away.
	handleLoadIsDone = documentId => {
		const newSelectedItem = { ...this.props.selectedItem, documentId };
		if (newSelectedItem.id === this.doubleClickedItemId) {
			this.props.determineAndHandleItemSubmitForSelectedItem(newSelectedItem);
		}
		this.props.onItemIsLoaded(newSelectedItem.id);
		this.props.onItemSelect(newSelectedItem);
	};

	handleSubmitButtonClick = () =>
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));

	render() {
		const {
			cancelModal,
			data: {
				browseContextDocumentId,
				isCancelable,
				modalIcon,
				modalPrimaryButtonLabel,
				modalTitle
			},
			hierarchyItems,
			isSubmitButtonDisabled,
			items,
			onItemIsErrored,
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
			<Modal size="l" isFullHeight onKeyDown={this.handleKeyDown}>
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

							{selectedItem && selectedItem.type !== 'folder' && (
								<ModalContent flexDirection="column">
									<DocumentPreview
										onItemIsErrored={onItemIsErrored}
										onLoadIsDone={this.handleLoadIsDone}
										selectedItem={selectedItem}
											referrerDocumentId={browseContextDocumentId}
										stateLabels={stateLabels}
									/>
								</ModalContent>
							)}
						</ModalContent>
					</ModalContent>
				</ModalBody>

				<ModalFooter>
					{isCancelable && (
						<Button type="default" label={t('Cancel')} onClick={cancelModal} />
					)}

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
			lastOpenedState,
			onInitialSelectedItemIdChange,
			refreshItems
		} = this.props;

		const { hierarchyItems } = lastOpenedState;

		const initialSelectedItem = documentId
			? { id: documentsManager.getRemoteDocumentId(documentId) }
			: null;
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

DocumentBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(DocumentBrowserModal);
DocumentBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentBrowserModal);

export default DocumentBrowserModal;
