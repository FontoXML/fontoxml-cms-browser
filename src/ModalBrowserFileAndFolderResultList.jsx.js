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
			labels,
			onItemSelect,
			onSubmit,
			renderGridItem,
			renderListItem,
			request,
			selectedItem,
			viewMode
		} = this.props;

		if ((request.type === 'browse' || request.type === 'upload') && request.busy) {
			return (
				<StateMessage
					visual={<SpinnerIcon />}
					title={labels.states.loading.title}
					message={labels.states.loading.message}
				/>
			);
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
