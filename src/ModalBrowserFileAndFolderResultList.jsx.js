import React, { Component } from 'react';

import {
	SpinnerIcon,
	StateMessage,
	VirtualGrid,
	VirtualList
} from 'fontoxml-vendor-fds/components';

import refreshItems from './refreshItems.jsx';

class ModalBrowserFileAndFolderResultList extends Component {
	render() {
		const {
			items,
			onItemSelect,
			onSubmit,
			renderGridItem,
			renderListItem,
			request,
			selectedItem,
			stateLabels,
			viewMode
		} = this.props;

		if ((request.type === 'browse' || request.type === 'upload') && request.busy) {
			return <StateMessage visual={<SpinnerIcon />} {...stateLabels.loading} />;
		}

		if (request.type === 'browse' && request.error) {
			return (
				<StateMessage
					connotation="warning"
					visual="exclamation-triangle"
					{...stateLabels.browseError}
				/>
			);
		}

		if (items.length === 0) {
			return <StateMessage visual="folder-open-o" {...stateLabels.empty} />;
		}

		if (viewMode.name === 'list') {
			return (
				<VirtualList
					estimatedItemHeight={30}
					items={items}
					paddingSize="m"
					renderItem={renderListItem}
					selectedItems={selectedItem === null ? [] : [selectedItem]}
				/>
			);
		}

		// else the viewMode.name is 'grid'
		return (
			<VirtualGrid
				estimatedRowHeight={86}
				items={items}
				onItemClick={onItemSelect}
				onItemDoubleClick={item =>
					item.type === 'folder' ? refreshItems(this.props, item) : onSubmit(item)}
				paddingSize="m"
				renderItem={renderGridItem}
				selectedItems={selectedItem === null ? [] : [selectedItem]}
			/>
		);
	}
}

export default ModalBrowserFileAndFolderResultList;
