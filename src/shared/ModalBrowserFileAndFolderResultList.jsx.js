import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { SpinnerIcon, StateMessage, VirtualGrid, VirtualList } from 'fds/components';

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

	render() {
		const {
			items,
			renderGridItem,
			renderListItem,
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

		if (viewMode.name === 'list') {
			return (
				<VirtualList
					estimatedItemHeight={30}
					items={items}
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
				onItemClick={this.handleItemClick}
				onItemDoubleClick={this.handleItemDoubleClick}
				paddingSize="m"
				renderItem={renderGridItem}
				idToScrollIntoView={selectedItem ? selectedItem.id : null}
			/>
		);
	}
}

export default ModalBrowserFileAndFolderResultList;
