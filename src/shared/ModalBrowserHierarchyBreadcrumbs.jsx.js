import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { BreadcrumbItemLink, Breadcrumbs } from 'fontoxml-vendor-fds/components';
import { truncatedBreadcrumbItemLinkWidth } from 'fontoxml-vendor-fds/system';

import refreshItems from '../refreshItems.jsx';

class ModalBrowserHierarchyBreadcrumbs extends Component {
	static defaultProps = {
		breadcrumbItems: [],
		browseContextDocumentId: null,
		initialSelectedFileId: null,
		selectedItem: null
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,
		dataProviderName: PropTypes.string.isRequired,

		// from withModularBrowserCapabilities
		breadcrumbItems: PropTypes.array,
		initialSelectedFileId: PropTypes.string,
		onItemSelect: PropTypes.func.isRequired,
		onUpdateInitialSelectedFileId: PropTypes.func.isRequired,
		onUpdateItems: PropTypes.func.isRequired,
		onUpdateRequest: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired,
		selectedItem: PropTypes.object
	};

	handleRenderBreadcrumbItem = ({ key, isDisabled, isLastItem, item, onRef }) => (
		<BreadcrumbItemLink
			key={key}
			label={item.label}
			isDisabled={isDisabled}
			isLastItem={isLastItem}
			onClick={() =>
				refreshItems(
					this.props.breadcrumbItems,
					this.props.browseContextDocumentId,
					this.props.dataProviderName,
					item,
					this.props.initialSelectedFileId,
					this.props.onItemSelect,
					this.props.onUpdateInitialSelectedFileId,
					this.props.onUpdateItems,
					this.props.onUpdateRequest,
					this.props.selectedItem,
					true
				)}
			onRef={onRef}
		/>
	);

	render() {
		const { request } = this.props;
		return (
			<Breadcrumbs
				isDisabled={
					(request.type === 'browse' || request.type === 'upload') && request.busy
				}
				items={this.props.breadcrumbItems}
				renderBreadcrumbItem={this.handleRenderBreadcrumbItem}
				truncatedItemWidth={truncatedBreadcrumbItemLinkWidth}
			/>
		);
	}
}

export default ModalBrowserHierarchyBreadcrumbs;
