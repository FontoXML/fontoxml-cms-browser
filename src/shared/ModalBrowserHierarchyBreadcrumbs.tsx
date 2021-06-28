import { BreadcrumbItemLink, Breadcrumbs, MenuItem } from 'fds/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class ModalBrowserHierarchyBreadcrumbs extends Component {
	static defaultProps = {
		browseContextDocumentId: null,
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,

		// from withModularBrowserCapabilities
		hierarchyItems: PropTypes.array,
		refreshItems: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired,
	};

	renderBreadcrumbItem = ({
		key,
		isDisabled,
		isDropOpened,
		isLastItem,
		item,
		onClick,
		onRef,
	}) => (
		<BreadcrumbItemLink
			key={key}
			label={item.label}
			isDisabled={isDisabled}
			isDropOpened={isDropOpened}
			isLastItem={isLastItem}
			onClick={() => {
				onClick();

				if (item.label !== '…') {
					this.props.refreshItems(
						this.props.browseContextDocumentId,
						item,
						true
					);
				}
			}}
			onRef={onRef}
		/>
	);

	renderTruncatedBreadcrumbMenuItem = ({
		key,
		onClick,
		isDisabled,
		item,
	}) => (
		<MenuItem
			key={key}
			isDisabled={isDisabled}
			label={item.label}
			onClick={() => {
				onClick();

				this.props.refreshItems(
					this.props.browseContextDocumentId,
					item,
					true
				);
			}}
		/>
	);

	render() {
		const { request } = this.props;
		return (
			<Breadcrumbs
				isDisabled={
					(request.type === 'browse' || request.type === 'upload') &&
					request.busy
				}
				items={this.props.hierarchyItems}
				renderBreadcrumbItem={this.renderBreadcrumbItem}
				renderTruncatedBreadcrumbMenuItem={
					this.renderTruncatedBreadcrumbMenuItem
				}
			/>
		);
	}
}

export default ModalBrowserHierarchyBreadcrumbs;
