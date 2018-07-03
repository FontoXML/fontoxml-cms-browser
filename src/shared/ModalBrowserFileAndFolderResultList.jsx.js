import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { SpinnerIcon, StateMessage, VirtualGrid, VirtualList } from 'fds/components';

import ModalBrowserLoadMore from './ModalBrowserLoadMore.jsx';

class ModalBrowserFileAndFolderResultList extends Component {
	static defaultProps = {
		browseContextDocumentId: null,
		onItemSubmit: () => {},
		selectedItem: null
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,
		onItemSubmit: PropTypes.func,
		renderGridItem: PropTypes.func.isRequired,
		renderListItem: PropTypes.func.isRequired,
		stateLabels: PropTypes.shape({
			browseError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			empty: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loading: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		items: PropTypes.array.isRequired,
		loadMore: PropTypes.func,
		loadMoreCurrentItems: PropTypes.number,
		loadMoreTotalItems: PropTypes.number,
		onItemSelect: PropTypes.func.isRequired,
		refreshItems: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired,
		selectedItem: PropTypes.object,
		viewMode: PropTypes.object.isRequired
	};

	handleItemDoubleClick = item =>
		item.type === 'folder'
			? this.props.refreshItems(this.props.browseContextDocumentId, item)
			: this.props.onItemSubmit(item);

	handleItemClick = item => {
		// Check if item is already selected, so that a documentId and/or nodeId on the selectedItem aren't overwritten
		if (!this.props.selectedItem || item.id !== this.props.selectedItem.id) {
			this.props.onItemSelect(item);
		}
	};

	renderListItem = props =>
		this.props.renderListItem({
			...props,
			isSelected: this.props.selectedItem
				? this.props.selectedItem.id === props.item.id
				: false
		});

	renderGridItem = props =>
		this.props.renderGridItem({
			...props,
			isSelected: this.props.selectedItem
				? this.props.selectedItem.id === props.item.id
				: false
		});

	render() {
		const {
			items,
			loadMore,
			loadMoreCurrentItems,
			loadMoreTotalItems,
			request,
			selectedItem,
			stateLabels,
			viewMode
		} = this.props;

		if ((request.type === 'browse' || request.type === 'upload') && request.busy) {
			return (
				<StateMessage paddingSize="m" visual={<SpinnerIcon />} {...stateLabels.loading} />
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
			return <StateMessage paddingSize="m" visual="folder-open-o" {...stateLabels.empty} />;
		}

		const fragmentToReturn = [];

		if (loadMore) {
			fragmentToReturn.push(
				<ModalBrowserLoadMore
					key="pagination-top"
					currentItems={loadMoreCurrentItems}
					onButtonClick={loadMore}
					paddingVertical="0.5rem"
					showButton={false}
					totalItems={loadMoreTotalItems}
				/>
			);
		}

		if (viewMode.name === 'list') {
			fragmentToReturn.push(
				<VirtualList
					key="list"
					estimatedItemHeight={30}
					idToScrollIntoView={selectedItem ? selectedItem.id : null}
					items={items}
					onItemClick={this.handleItemClick}
					onItemDoubleClick={this.handleItemDoubleClick}
					paddingSize="m"
					renderItem={this.renderListItem}
				/>
			);
		}

		// else the viewMode.name is 'grid'
		fragmentToReturn.push(
			<VirtualGrid
				key="grid"
				estimatedRowHeight={86}
				idToScrollIntoView={selectedItem ? selectedItem.id : null}
				items={items}
				onItemClick={this.handleItemClick}
				onItemDoubleClick={this.handleItemDoubleClick}
				paddingSize="m"
				renderItem={this.renderGridItem}
			/>
		);

		if (loadMore) {
			fragmentToReturn.push(
				<ModalBrowserLoadMore
					key="pagination-bottom"
					currentItems={loadMoreCurrentItems}
					onButtonClick={loadMore}
					paddingVertical="2rem"
					showButton={loadMoreCurrentItems < loadMoreTotalItems}
					totalItems={loadMoreTotalItems}
				/>
			);
		}

		return fragmentToReturn;
	}
}

export default ModalBrowserFileAndFolderResultList;
