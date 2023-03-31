import { Component } from 'react';

import configurationManager from 'fontoxml-configuration/src/configurationManager';
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalContentToolbar,
	ModalFooter,
	ModalHeader,
} from 'fontoxml-design-system/src/components';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';

import ModalBrowserFileAndFolderResultList from '../shared/ModalBrowserFileAndFolderResultList';
import ModalBrowserHierarchyBreadcrumbs from '../shared/ModalBrowserHierarchyBreadcrumbs';
import ModalBrowserListOrGridViewMode, {
	VIEWMODES,
} from '../shared/ModalBrowserListOrGridViewMode';
import withInsertOperationNameCapabilities from '../withInsertOperationNameCapabilities';
import withModularBrowserCapabilities from '../withModularBrowserCapabilities';
import DocumentGridItem from './DocumentGridItem';
import DocumentListItem from './DocumentListItem';
import DocumentPreview from './DocumentPreview';

const cmsBrowserSendsHierarchyItemsInBrowseResponse = configurationManager.get(
	'cms-browser-sends-hierarchy-items-in-browse-response'
);

const stateLabels = {
	loading: {
		title: t('Loading templates…'),
		message: null,
	},
	browseError: {
		title: t('Can’t open this folder'),
		message: null,
	},
	empty: {
		title: t('No results'),
		message: t(
			'This folder does not contain files that can be opened with Fonto.'
		),
	},
	loadingPreview: {
		title: t('Loading template preview…'),
		message: null,
	},
	previewError: {
		title: t('Can’t open this template'),
		message: t(
			'Fonto can’t open this template. You can try again, or try a different template.'
		),
	},
};

function getSubmitModalData(itemToSubmit) {
	return {
		remoteDocumentId: itemToSubmit.id,
		label: itemToSubmit.label,
	};
}

function canSubmitSelectedItem(selectedItem) {
	return !!(selectedItem && selectedItem.type !== 'folder');
}

type Props = ModalProps<{
	browseContextDocumentId?: string;
	dataProviderName: string;
	insertOperationName?: string;
	modalIcon?: string;
	modalPrimaryButtonLabel?: string;
	modalTitle?: string;
}> & {
	remoteDocumentId?: string;
};

class DocumentTemplateBrowserModal extends Component<Props> {
	public static defaultProps = {
		remoteDocumentId: null,
	};

	private readonly handleKeyDown = (event) => {
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

	private readonly handleRenderListItem = ({
		key,
		item,
		onClick,
		onDoubleClick,
		onRef,
	}) => (
		<DocumentListItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={
				this.props.selectedItem &&
				this.props.selectedItem.id === item.id
			}
			item={
				item.icon || item.type === 'folder'
					? item
					: { ...item, icon: 'file-o' }
			}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onRef={onRef}
		/>
	);

	private readonly handleRenderGridItem = ({
		key,
		item,
		onClick,
		onDoubleClick,
	}) => (
		<DocumentGridItem
			key={key}
			isDisabled={item.isDisabled}
			isErrored={this.props.isItemErrored(item)}
			isSelected={
				this.props.selectedItem &&
				this.props.selectedItem.id === item.id
			}
			item={
				item.icon || item.type === 'folder'
					? item
					: { ...item, icon: 'file-o' }
			}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	private readonly handleFileAndFolderResultListItemSubmit = (
		selectedItem
	) => {
		this.props.determineAndHandleItemSubmitForSelectedItem(selectedItem);
	};

	private readonly handleLoadIsDone = () => {
		this.props.onItemIsLoaded(this.props.selectedItem.id);
	};

	private readonly handleSubmitButtonClick = () => {
		this.props.submitModal(getSubmitModalData(this.props.selectedItem));
	};

	public override render(): JSX.Element {
		const {
			cancelModal,
			data: {
				browseContextDocumentId,
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
			<Modal size="l" onKeyDown={this.handleKeyDown} isFullHeight>
				<ModalHeader
					icon={modalIcon}
					title={modalTitle || t('Select a template')}
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
									onItemSubmit={
										this
											.handleFileAndFolderResultListItemSubmit
									}
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
								<ModalContent flexDirection="column" flex="2">
									<DocumentPreview
										onItemIsErrored={onItemIsErrored}
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
						label={modalPrimaryButtonLabel || t('Select')}
						isDisabled={isSubmitButtonDisabled}
						onClick={this.handleSubmitButtonClick}
					/>
				</ModalFooter>
			</Modal>
		);
	}

	public override componentDidMount(): void {
		const {
			data: { browseContextDocumentId },
			lastOpenedState,
			onInitialSelectedItemIdChange,
			refreshItems,
			remoteDocumentId,
		} = this.props;

		const { hierarchyItems } = lastOpenedState;

		const initialSelectedItem = remoteDocumentId
			? { id: remoteDocumentId }
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

DocumentTemplateBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(
	DocumentTemplateBrowserModal
);
DocumentTemplateBrowserModal = withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
)(DocumentTemplateBrowserModal);

export default DocumentTemplateBrowserModal;
