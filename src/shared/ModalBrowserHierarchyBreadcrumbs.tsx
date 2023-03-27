import * as React from 'react';

import {
	BreadcrumbItemLink,
	Breadcrumbs,
	MenuItem,
} from 'fontoxml-design-system/src/components';

type Props = {
	browseContextDocumentId?: string;

	// from withModularBrowserCapabilities
	hierarchyItems?: unknown[];
	refreshItems(...args: unknown[]): unknown;
	request: object;
};

const ModalBrowserHierarchyBreadcrumbs: React.FC<Props> = ({
	browseContextDocumentId = null,
	hierarchyItems,
	refreshItems,
	request,
}) => {
	const renderBreadcrumbItem = React.useCallback(
		({
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
						refreshItems(browseContextDocumentId, item, true);
					}
				}}
				onRef={onRef}
			/>
		),
		[browseContextDocumentId, refreshItems]
	);

	const renderTruncatedBreadcrumbMenuItem = React.useCallback(
		({ key, onClick, isDisabled, item }) => (
			<MenuItem
				key={key}
				isDisabled={isDisabled}
				label={item.label}
				onClick={() => {
					onClick();

					refreshItems(browseContextDocumentId, item, true);
				}}
			/>
		),
		[browseContextDocumentId, refreshItems]
	);

	return (
		<Breadcrumbs
			isDisabled={
				(request.type === 'browse' || request.type === 'upload') &&
				request.busy
			}
			items={hierarchyItems}
			renderBreadcrumbItem={renderBreadcrumbItem}
			renderTruncatedBreadcrumbMenuItem={
				renderTruncatedBreadcrumbMenuItem
			}
		/>
	);
};

export default ModalBrowserHierarchyBreadcrumbs;
