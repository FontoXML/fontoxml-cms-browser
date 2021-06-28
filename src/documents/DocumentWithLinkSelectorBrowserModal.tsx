import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
} from 'fds/components';
import documentsManager from 'fontoxml-documents/src/documentsManager';

import configurationManager from 'fontoxml-configuration/src/configurationManager';
import t from 'fontoxml-localization/src/t';

import DocumentGridItem from './DocumentGridItem';
import DocumentListItem from './DocumentListItem';
import DocumentWithLinkSelectorPreview from './DocumentWithLinkSelectorPreview';
import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES,
} from '../shared/ModalBrowserListOrGridViewMode';
import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities';

const cmsBrowserSendsHierarchyItemsInBrowseResponse = configurationManager.get(
	'cms-browser-sends-hierarchy-items-in-browse-response'
);

const stateLabels = {
	loading: {
		title: t('Loading documents…'),
		message: null,
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: t(
			'Fonto can’t open this folder. You can try again, or try a different folder.'
		),
	},
	empty: {
		title: t('No results'),
		message: t(
			'This folder does not contain files that can be opened with Fonto.'
		),
	},
	loadingPreview: {
		title: t('Loading document preview…'),
		message: null,
	},
};

function getSubmitModalData(itemToSubmit) {
	return {
		documentId: itemToSubmit.documentId,
		nodeId: itemToSubmit.nodeId,
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.documentId && selectedItem.nodeId);
}

class DocumentWithLinkSelectorBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			documentId: PropTypes.string,
			insertOperationName: PropTypes.string,
			linkableElementsQuery: PropTypes.string.isRequired,
			modalIcon: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string,
			nodeId: PropTypes.string,
		}).isRequired,
		submitModal: PropTypes.func.isRequired,
	};

	handleKeyDown = (event) => {
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (!this.props.isSubmitButtonDisabled) {
					this.props.submitModal(
						getSubmitModalData(this.props.selectedItem)
					);
				}
				break;
		}
	};

	handleRenderListItem = ({ key, item, onClick, onDoubleClick, onRef }) => (
		<DocumentListItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={
				this.props.selectedItem &&
				this.props.selectedItem.id === item.id
			}
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onRef={onRef}
		/>
	);

	handleRenderGridItem = ({ key, item, onClick, onDoubleClick }) => (
		<DocumentGridItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={
				this.props.selectedItem &&
				this.props.selectedItem.id === item.id
			}
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleLoadIsDone = () => {
		this.props.onItemIsLoaded(this.props.selectedItem.id);
	};

	handleSubmitButtonClick = () =>
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));

	render() {
		const {
			cancelModal,
			data: {
				browseContextDocumentId,
				linkableElementsQuery,
				modalIcon,
				modalPrimaryButtonLabel,
				modalTitle,
			},
			hierarchyItems,
			isSubmitButtonDisabled,
			items,
			onItemIsErrored,
			onItemSelect,
			onViewModeChange,
			refreshItems,
			request,
			selectedItem,
			viewMode,
		} = this.props;
		const hasHierarchyItems = hierarchyItems.length > 0;

		return (
			<Modal size="l" isFullHeight={true} onKeyDown={this.handleKeyDown}>
				<ModalHeader
					icon={modalIcon}
					title={modalTitle || t('Select a link')}
				/>

				<ModalBody>
					<ModalContent flexDirection="column">
						<ModalContentToolbar
							justifyContent={
								hasHierarchyItems ? 'space-between' : 'flex-end'
							}
						>
							{hasHierarchyItems && (
								<ModalBrowserHierarchyBreadcrumbs
									browseContextDocumentId={
										browseContextDocumentId
									}
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
							<ModalContent flexDirection="column" flex="1">
								<ModalBrowserFileAndFolderResultList
									browseContextDocumentId={
										browseContextDocumentId
									}
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
								selectedItem.id &&
								selectedItem.type !== 'folder' && (
									<ModalContent
										flexDirection="column"
										flex="2"
									>
										<DocumentWithLinkSelectorPreview
											linkableElementsQuery={
												linkableElementsQuery
											}
											onItemIsErrored={onItemIsErrored}
											onItemSelect={onItemSelect}
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
					<Button
						type="default"
						label={t('Cancel')}
						onClick={cancelModal}
					/>

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
			refreshItems,
		} = this.props;

		const { hierarchyItems } = lastOpenedState;

		const initialSelectedItem = documentId
			? { id: documentsManager.getRemoteDocumentId(documentId) }
			: null;
		if (
			cmsBrowserSendsHierarchyItemsInBrowseResponse &&
			initialSelectedItem
		) {
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

DocumentWithLinkSelectorBrowserModal = withModularBrowserCapabilities(
	VIEWMODES.LIST
)(DocumentWithLinkSelectorBrowserModal);
DocumentWithLinkSelectorBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentWithLinkSelectorBrowserModal);

export default DocumentWithLinkSelectorBrowserModal;
