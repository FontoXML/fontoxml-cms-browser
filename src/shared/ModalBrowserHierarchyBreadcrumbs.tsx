import type { FC } from 'react';
import { useCallback } from 'react';

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

const ModalBrowserHierarchyBreadcrumbs: FC<Props> = ({
	browseContextDocumentId = null,
	hierarchyItems,
	refreshItems,
	request,
}) => {
	const renderBreadcrumbItem = useCallback(
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

	const renderTruncatedBreadcrumbMenuItem = useCallback(
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
