import * as React from 'react';

import {
	SpinnerIcon,
	StateMessage,
	VirtualGrid,
	VirtualList,
} from 'fontoxml-design-system/src/components';

type Props = {
	browseContextDocumentId?: string;
	onItemSubmit?(...args: unknown[]): unknown;
	renderGridItem(...args: unknown[]): unknown;
	renderListItem(...args: unknown[]): unknown;
	stateLabels: {
		browseError: {
			title?: string;
			message?: string;
		};
		empty: {
			title?: string;
			message?: string;
		};
		loading: {
			title?: string;
			message?: string;
		};
	};
	items: unknown[];
	onItemSelect(newSelectedItem: unknown): unknown;
	refreshItems(...args: unknown[]): unknown;
	request: object;
	selectedItem?: object;
	viewMode: object;
};

class ModalBrowserFileAndFolderResultList extends React.Component<Props> {
	public static defaultProps = {
		browseContextDocumentId: null,
		onItemSubmit: (_item): void => undefined,
		selectedItem: null,
	};

	public override state = {
		windowHeight: null,
	};

	private readonly handleItemDoubleClick = (item) =>
		item.type === 'folder'
			? this.props.refreshItems(this.props.browseContextDocumentId, item)
			: this.props.onItemSubmit(item);

	private readonly handleItemClick = (item) => {
		// Check if item is already selected, so that a documentId and/or nodeId on the selectedItem aren't overwritten
		if (
			!this.props.selectedItem ||
			item.id !== this.props.selectedItem.id
		) {
			this.props.onItemSelect(item);
		}
	};

	public override render(): JSX.Element {
		const {
			items,
			renderGridItem,
			renderListItem,
			request,
			selectedItem,
			stateLabels,
			viewMode,
		} = this.props;
		const { windowHeight } = this.state;

		if (
			(request.type === 'browse' || request.type === 'upload') &&
			request.busy
		) {
			return (
				<StateMessage
					paddingSize="m"
					visual={<SpinnerIcon />}
					{...stateLabels.loading}
				/>
			);
		}

		if (request.type === 'browse' && request.error) {
			return (
				<StateMessage
					connotation="warning"
					paddingSize="m"
					visual="exclamation-triangle"
					{...stateLabels.browseError}
				/>
			);
		}

		if (items.length === 0) {
			return (
				<StateMessage
					paddingSize="m"
					visual="folder-open-o"
					{...stateLabels.empty}
				/>
			);
		}

		if (viewMode.name === 'list') {
			return (
				<VirtualList
					estimatedItemHeight={30}
					items={items}
					maxHeight={windowHeight}
					onItemClick={this.handleItemClick}
					onItemDoubleClick={this.handleItemDoubleClick}
					paddingSize="m"
					renderItem={renderListItem}
					idToScrollIntoView={selectedItem ? selectedItem.id : null}
				/>
			);
		}

		// else the viewMode.name is 'grid'
		return (
			<VirtualGrid
				estimatedRowHeight={86}
				items={items}
				maxHeight={windowHeight}
				onItemClick={this.handleItemClick}
				onItemDoubleClick={this.handleItemDoubleClick}
				paddingSize="m"
				renderItem={renderGridItem}
				idToScrollIntoView={selectedItem ? selectedItem.id : null}
			/>
		);
	}

	private readonly updateWindowHeight = () => {
		// Fix for VirtualList/VirtualGrid growing inside the Modal without a fixed height.
		// Passed to the maxHeight property of both components.
		this.setState({ windowHeight: window.innerHeight });
	};

	public override componentDidMount(): void {
		this.updateWindowHeight();

		window.addEventListener('resize', this.updateWindowHeight);
	}

	public override componentWillUnmount(): void {
		window.removeEventListener('resize', this.updateWindowHeight);
	}
}

export default ModalBrowserFileAndFolderResultList;
