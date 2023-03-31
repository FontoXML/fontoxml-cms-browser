import { Component } from 'react';

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
import withModularBrowserCapabilities from '../withModularBrowserCapabilities';
import DocumentGridItem from './DocumentGridItem';
import DocumentListItem from './DocumentListItem';

const stateLabels = {
	loading: {
		title: t('Loading folders…'),
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
		message: null,
	},
};

type Props = ModalProps<{
	browseContextDocumentId?: string;
	dataProviderName: string;
	modalTitle?: string;
	modalPrimaryButtonLabel?: string;
}>;

class FolderBrowserModal extends Component<Props> {
	private readonly handleKeyDown = (event) => {
		const { selectedItem } = this.props;
		switch (event.key) {
			case 'Escape':
				this.props.cancelModal();
				break;
			case 'Enter':
				if (selectedItem && selectedItem.id) {
					this.props.submitModal(selectedItem);
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

	private readonly handleRenderGridItem = ({
		key,
		item,
		onClick,
		onDoubleClick,
	}) => (
		<DocumentGridItem
			key={key}
			isDisabled={item.isDisabled}
			isSelected={
				this.props.selectedItem &&
				this.props.selectedItem.id === item.id
			}
			item={item}
			onClick={onClick}
			onDoubleClick={onDoubleClick}
		/>
	);

	private readonly handleSubmitButtonClick = () => {
		this.props.submitModal(this.props.selectedItem);
	};

	public override render(): JSX.Element {
		const {
			cancelModal,
			data: {
				browseContextDocumentId,
				modalPrimaryButtonLabel,
				modalTitle,
			},
			hierarchyItems,
			items,
			onItemSelect,
			onViewModeChange,
			refreshItems,
			request,
			selectedItem,
			viewMode,
		} = this.props;
		const hasHierarchyItems = hierarchyItems.length > 0;

		return (
			<Modal size="s" onKeyDown={this.handleKeyDown}>
				<ModalHeader title={modalTitle || t('Select a folder')} />

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

						<ModalContent flexDirection="column">
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
						isDisabled={!selectedItem || !selectedItem.id}
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
			refreshItems,
		} = this.props;

		const { hierarchyItems } = lastOpenedState;

		if (hierarchyItems && hierarchyItems.length > 1) {
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

FolderBrowserModal = withModularBrowserCapabilities(VIEWMODES.LIST)(
	FolderBrowserModal
);

export default FolderBrowserModal;
