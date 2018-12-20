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
		title: t('Loading templates…'),
		message: null
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: null
	},
	empty: {
		title: t('No results'),
		message: t('This folder does not contain files that can be opened with Fonto.')
	},
	loadingPreview: {
		title: t('Loading template preview…'),
		message: null
	},
	previewError: {
		title: t('Can’t open this template'),
		message: t(
			'Fonto can’t open this template. You can try again, or try a different template.'
		)
	}
};

function getSubmitModalData(itemToSubmit) {
	return {
		remoteDocumentId: itemToSubmit.id,
		label: itemToSubmit.label
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.type !== 'folder');
}

class DocumentTemplateBrowserModal extends Component {
	static defaultProps = {
		remoteDocumentId: null
	};

	static propTypes = {
		cancelModal: PropTypes.func.isRequired,
		data: PropTypes.shape({
			browseContextDocumentId: PropTypes.string,
			dataProviderName: PropTypes.string.isRequired,
			insertOperationName: PropTypes.string,
			modalIcon: PropTypes.string,
			modalPrimaryButtonLabel: PropTypes.string,
			modalTitle: PropTypes.string
		}).isRequired,
		remoteDocumentId: PropTypes.string,
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

	handleRenderListItem = ({ key, item, onClick, onDoubleClick, onRef }) => (
		<DocumentListItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item.icon || item.type === 'folder' ? item : { ...item, icon: 'file-o' }}
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
			isSelected={this.props.selectedItem && this.props.selectedItem.id === item.id}
			item={item.icon || item.type === 'folder' ? item : { ...item, icon: 'file-o' }}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	handleFileAndFolderResultListItemSubmit = selectedItem => {
		this.props.determineAndHandleItemSubmitForSelectedItem(selectedItem);
	};

	handleLoadIsDone = () => {
		this.props.onItemIsLoaded(this.props.selectedItem.id);
	};

	handleSubmitButtonClick = () =>
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));

	render() {
		const {
			cancelModal,
			data: { browseContextDocumentId, modalIcon, modalPrimaryButtonLabel, modalTitle },
			hierarchyItems,
			isSubmitButtonDisabled,
			items,
			onItemIsErrored,
			onItemSelect,
			onViewModeChange,
			refreshItems,
			request,
			selectedItem,
			viewMode
		} = this.props;
		const hasHierarchyItems = hierarchyItems.length > 0;

		return (
			<Modal size="m" onKeyDown={this.handleKeyDown}>
				<ModalHeader icon={modalIcon} title={modalTitle || t('Select a template')} />

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
					<Button type="default" label={t('Cancel')} onClick={cancelModal} />

					<Button
						type="primary"
						label={modalPrimaryButtonLabel || t('Select')}
						isDisabled={isSubmitButtonDisabled}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	componentDidMount() {
		const {
			data: { browseContextDocumentId },
			lastOpenedState,
			onInitialSelectedItemIdChange,
			refreshItems,
			remoteDocumentId
		} = this.props;

		const { hierarchyItems } = lastOpenedState;

		const initialSelectedItem = remoteDocumentId ? { id: remoteDocumentId } : null;
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

DocumentTemplateBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(
	DocumentTemplateBrowserModal
);
DocumentTemplateBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentTemplateBrowserModal);

export default DocumentTemplateBrowserModal;
