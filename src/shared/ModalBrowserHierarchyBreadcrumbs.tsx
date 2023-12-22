import type { ComponentProps, FC } from 'react';
import { useCallback } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import {
	BreadcrumbItemLink,
	Breadcrumbs,
	MenuItem,
} from 'fontoxml-design-system/src/components';

import type useBrowse from './useBrowse';
import type useUpload from './useUpload';

type Props = {
	browseRequestState: ReturnType<typeof useBrowse>['browseRequestState'];
	onItemClick: (item: BrowseResponseItem) => void;
	uploadRequestState?: ReturnType<typeof useUpload>['uploadRequestState'];
};

const ModalBrowserHierarchyBreadcrumbs: FC<Props> = ({
	browseRequestState,
	onItemClick,
	uploadRequestState,
}) => {
	const renderBreadcrumbItem = useCallback<
		ComponentProps<typeof Breadcrumbs>['renderBreadcrumbItem']
	>(
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
				onClick={(event) => {
					onClick(event);

					if (item.label !== '…') {
						onItemClick(item as BrowseResponseItem);
					}
				}}
				onRef={onRef}
			/>
		),
		[onItemClick]
	);

	const renderTruncatedBreadcrumbMenuItem = useCallback<
		Exclude<
			ComponentProps<
				typeof Breadcrumbs
			>['renderTruncatedBreadcrumbMenuItem'],
			undefined
		>
	>(
		({ key, onClick, isDisabled, item }) => (
			<MenuItem
				key={key}
				isDisabled={isDisabled}
				label={item.label}
				onClick={(event) => {
					onClick(event);

					onItemClick(item as BrowseResponseItem);
				}}
			/>
		),
		[onItemClick]
	);

	return (
		<Breadcrumbs
			isDisabled={
				browseRequestState.name === 'loading' ||
				(uploadRequestState && uploadRequestState.name === 'loading')
			}
			items={
				browseRequestState.name === 'successful'
					? browseRequestState.hierarchyItems
					: []
			}
			renderBreadcrumbItem={renderBreadcrumbItem}
			renderTruncatedBreadcrumbMenuItem={
				renderTruncatedBreadcrumbMenuItem
			}
		/>
	);
};

export default ModalBrowserHierarchyBreadcrumbs;
