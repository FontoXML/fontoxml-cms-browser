import React, { Component } from 'react';

import { Grid, List } from 'fontoxml-vendor-fds/components';

import refreshItems from './refreshItems.jsx';

class ModalBrowserFileAndFolderResultList extends Component {
	render() {
		if (this.props.viewMode === 'list') {
			return (
				<List
					items={this.props.items}
					onItemClick={this.props.onItemSelect}
					onItemDoubleClick={item =>
						item.type === 'folder'
							? refreshItems(this.props, item)
							: this.props.onSubmit(item)}
					selectedItem={this.props.selectedItem}
					renderItem={this.props.renderListItem}
				/>
			);
		}

		// else the viewMode is 'grid'
		return (
			<Grid
				items={this.props.items}
				onItemClick={this.props.onItemSelect}
				onItemDoubleClick={item =>
					item.type === 'folder'
						? refreshItems(this.props, item)
						: this.props.onSubmit(item)}
				selectedItem={this.props.selectedItem}
				renderItem={this.props.renderGridItem}
			/>
		);
	}
}

export default ModalBrowserFileAndFolderResultList;
