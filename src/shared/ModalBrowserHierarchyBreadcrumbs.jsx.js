import React, { Component } from 'react';

import { BreadcrumbItemLink, Breadcrumbs } from 'fontoxml-vendor-fds/components';
import { truncatedBreadcrumbItemLinkWidth } from 'fontoxml-vendor-fds/system';

import refreshItems from '../refreshItems.jsx';

class ModalBrowserHierarchyBreadcrumbs extends Component {
	handleRenderBreadcrumbItem = ({ key, isDisabled, isLastItem, item, onRef }) => (
		<BreadcrumbItemLink
			key={key}
			label={item.label}
			isDisabled={isDisabled}
			isLastItem={isLastItem}
			onClick={() => refreshItems(this.props, item, true)}
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
