import { BreadcrumbItemLink, Breadcrumbs, MenuItem } from 'fds/components';
import React, { Component } from 'react';

type Props = {
	browseContextDocumentId?: string;

	// from withModularBrowserCapabilities
	hierarchyItems?: unknown[];
	refreshItems(...args: unknown[]): unknown;
	request: object;
};

class ModalBrowserHierarchyBreadcrumbs extends Component<Props> {
	static defaultProps = {
		browseContextDocumentId: null,
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
