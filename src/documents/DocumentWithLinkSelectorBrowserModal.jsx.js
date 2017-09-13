import PropTypes from 'prop-types';
import React, { Component } from 'react';

import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import documentsManager from 'fontoxml-documents/documentsManager';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
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
import DocumentWithLinkSelectorPreview from './DocumentWithLinkSelectorPreview.jsx';
import documentLoader from '../loaders/documentLoader.jsx';
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

class DocumentWithLinkSelectorBrowserModal extends Component {
	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			documentId: PropTypes.string,
			linkableElementsQuery: PropTypes.string.isRequired,
			modalTitle: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			nodeId: PropTypes.string
		}).isRequired,
		submitModal: PropTypes.func.isRequired
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

	submitModal = itemToSubmit =>
		this.props.submitModal({
			documentId: itemToSubmit.documentId,
			nodeId: itemToSubmit.nodeId
		});

	handleFileAndFolderResultListItemSubmit = selectedItem => {
		this.props.loadItem(selectedItem.id).then(
			documentId => {
				const rootNode = documentsManager.getDocumentNode(documentId).documentElement;

				if (
					this.props.selectedItem.id === selectedItem.id &&
					rootNode &&
					evaluateXPathToBoolean(
						'let $selectableNodes := ' +
							this.props.data.linkableElementsQuery +
							' return . = $selectableNodes',
						rootNode,
						readOnlyBlueprint
					)
				) {
					this.submitModal({
						documentId,
						nodeId: getNodeId(rootNode)
					});
				}
			},
			_error => {
				return;
			}
		);
	};

	handleSubmitButtonClick = () => this.submitModal(this.props.selectedItem);

	render() {
		const {
			cancelModal,
			data: {
				browseContextDocumentId,
				linkableElementsQuery,
				modalPrimaryButtonLabel,
				modalTitle,
				nodeId
			},
			hierarchyItems,
			initialSelectedItemId,
			items,
			loadItem,
			onItemSelect,
			onViewModeChange,
			refreshItems,
			request,
			selectedItem,
			viewMode
		} = this.props;
		const hasHierarchyItems = hierarchyItems.length > 0;

		return (
			<Modal size="m" isFullHeight={true}>
				<ModalHeader title={modalTitle || t('Select a link')} />

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
									<DocumentWithLinkSelectorPreview
										initialNodeId={nodeId}
										initialSelectedItemId={initialSelectedItemId}
										linkableElementsQuery={linkableElementsQuery}
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
						isDisabled={
							!selectedItem || !selectedItem.documentId || !selectedItem.nodeId
						}
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

DocumentWithLinkSelectorBrowserModal = withModularBrowserCapabilities(
	DocumentWithLinkSelectorBrowserModal,
	documentLoader,
	VIEWMODES.LIST
);

export default DocumentWithLinkSelectorBrowserModal;
