import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { BreadcrumbItemLink, Breadcrumbs } from 'fds/components';
import { truncatedBreadcrumbItemLinkWidth } from 'fds/system';

class ModalBrowserHierarchyBreadcrumbs extends Component {
	static defaultProps = {
		browseContextDocumentId: null
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,

		// from withModularBrowserCapabilities
		hierarchyItems: PropTypes.array,
		refreshItems: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired
	};

	handleRenderBreadcrumbItem = ({ key, isDisabled, isLastItem, item, onRef }) => (
		<BreadcrumbItemLink
			key={key}
			label={item.label}
			isDisabled={isDisabled}
			isLastItem={isLastItem}
			onClick={() => this.props.refreshItems(this.props.browseContextDocumentId, item, true)}
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
				items={this.props.hierarchyItems}
				renderBreadcrumbItem={this.handleRenderBreadcrumbItem}
				truncatedItemWidth={truncatedBreadcrumbItemLinkWidth}
			/>
		);
	}
}

export default ModalBrowserHierarchyBreadcrumbs;
