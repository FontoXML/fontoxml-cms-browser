import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import connectorsManager from 'fontoxml-configuration/src/connectorsManager';
import type { CmsClientError } from 'fontoxml-connector/src/types';
import type StandardBrowseConnector from 'fontoxml-connectors-standard/src/StandardBrowseConnector';
import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

function getErrorMessage(error: unknown): string {
	if (!error) {
		return '';
	}

	if (error instanceof Error) {
		return error.message;
	}

	return `${error}`;
}

const configuredBrowseConnector =
	connectorsManager.getConnector('browse-connector');

type BrowseParams = Parameters<StandardBrowseConnector['browse']>;
type AssetTypes = BrowseParams[1];
type ResultTypes = BrowseParams[2];
type Query = BrowseParams[4];
type NoCache = BrowseParams[7];

export type BrowseContext = {
	remoteDocumentId?: RemoteDocumentId;
	query?: Query;
};
export type BrowseConfig = {
	assetTypes: AssetTypes;
	resultTypes: ResultTypes;
	rootFolderLabel: string;
};

type BrowseCallback = (
	browseContextDocumentId?: RemoteDocumentId,
	targetFolder?: BrowseResponseItem,
	noCache?: NoCache,
	hierarchyItemsOverride?: BrowseResponseItem[],
	additionalQueryProperties?: Query
) => Promise<{
	hierarchyItems: BrowseResponseItem[];
	items: BrowseResponseItem[];
} | void>;
type BrowseRequestState =
	| {
			errorMessage: string;
			folder: BrowseResponseItem;
			hierarchyItems: BrowseResponseItem[];
			name: 'errored';
	  }
	| {
			folder: BrowseResponseItem;
			hierarchyItems: BrowseResponseItem[];
			items: BrowseResponseItem[];
			name: 'successful';
	  }
	| {
			folder: BrowseResponseItem;
			name: 'uninitialized';
	  }
	| { folder: BrowseResponseItem; name: 'loading' };
type DeleteErrorForItemCallback = (id: BrowseResponseItem['id']) => void;
type HasErrorForItemCallback = (item: BrowseResponseItem) => boolean;
type SetErrorForItemCallback = (
	id: BrowseResponseItem['id'],
	error: unknown
) => void;

const lastOpenedStateByAssetAndResultTypes: Map<string, BrowseResponseItem[]> =
	new Map();

export default function useBrowse(
	context: BrowseContext,
	config: BrowseConfig,
	currentSelectedItemIdRef?: RefObject<BrowseResponseItem['id']>
): {
	browse: BrowseCallback;
	browseRequestState: BrowseRequestState;
	deleteErrorForItem: DeleteErrorForItemCallback;
	hasErrorForItem: HasErrorForItemCallback;
	setErrorForItem: SetErrorForItemCallback;
} {
	const rootHierarchyItem = useMemo<BrowseResponseItem>(
		() => ({
			id: null,
			label: config.rootFolderLabel,
			type: 'folder',
		}),
		[config.rootFolderLabel]
	);

	const [browseRequestState, setBrowseRequestState] =
		useState<BrowseRequestState>({
			folder: rootHierarchyItem,
			name: 'uninitialized',
		});

	// Errors that occurred when loading a item, for if the items are only loaded in the preview.
	const [errorByItemId, setErrorByItemId] = useState<
		Map<BrowseResponseItem['id'], unknown>
	>(() => new Map());
	// Contains the items that the user can choose from
	const hierarchyItems = useRef<BrowseResponseItem[]>([]);

	// Used to prevent parallel requests being in flight and to prevent setting
	// state on an unmounted component.
	// undefined === unmounted, Symbol() === in flight / initial
	const currentBrowseRequestToken = useRef<symbol | undefined>(
		Symbol('initial')
	);
	useEffect(() => {
		return () => {
			currentBrowseRequestToken.current = undefined;
		};
	}, []);

	const assetAndResultTypes = useMemo(
		() => `${config.assetTypes.join(',')}|${config.resultTypes.join(',')}`,
		[config.assetTypes, config.resultTypes]
	);

	const lastOpenedHierarchyItems = useMemo(
		() =>
			lastOpenedStateByAssetAndResultTypes.get(assetAndResultTypes) ?? [],
		[assetAndResultTypes]
	);

	useEffect(() => {
		return () => {
			// Remember the last opened hierarchy whenever we unmount.
			if (!currentBrowseRequestToken.current) {
				lastOpenedStateByAssetAndResultTypes.set(
					assetAndResultTypes,
					hierarchyItems.current
				);
			}
		};
	}, [assetAndResultTypes]);

	const hasErrorForItem = useCallback<HasErrorForItemCallback>(
		(item) => errorByItemId.has(item.id),
		[errorByItemId]
	);

	const setErrorForItem = useCallback<SetErrorForItemCallback>(
		(id, error) => {
			if (currentBrowseRequestToken.current) {
				setErrorByItemId((errorByItemId) => {
					const newErrorByItemId = new Map(errorByItemId);
					newErrorByItemId.set(id, error);
					return newErrorByItemId;
				});
			}
		},
		[]
	);

	const deleteErrorForItem = useCallback<DeleteErrorForItemCallback>((id) => {
		if (currentBrowseRequestToken.current) {
			setErrorByItemId((errorByItemId) => {
				const newErrorByItemId = new Map(errorByItemId);
				newErrorByItemId.delete(id);
				return newErrorByItemId;
			});
		}
	}, []);

	// Used to update the items with a browse callback
	const browse = useCallback<BrowseCallback>(
		(
			browseContextDocumentId,
			targetFolder = rootHierarchyItem,
			noCache = false,
			hierarchyItemsOverride = undefined,
			additionalQueryProperties = context.query
		): Promise<void> => {
			if (!currentBrowseRequestToken.current) {
				return Promise.resolve();
			}
			const token = Symbol(targetFolder.id || 'root');
			currentBrowseRequestToken.current = token;

			setBrowseRequestState({ folder: targetFolder, name: 'loading' });

			const oldHierarchyItems =
				hierarchyItemsOverride || hierarchyItems.current;

			return configuredBrowseConnector
				.browse(
					browseContextDocumentId,
					config.assetTypes,
					config.resultTypes,
					targetFolder.id || undefined,
					additionalQueryProperties,
					undefined,
					undefined,
					noCache
				)
				.then(
					(result) => {
						if (currentBrowseRequestToken.current !== token) {
							return;
						}

						let newHierarchyItems = result.metadata?.hierarchy;
						if (!newHierarchyItems) {
							newHierarchyItems = oldHierarchyItems.slice();

							const newLastFolderIsInCurrentFolderHierarchy =
								oldHierarchyItems.some(function (folder) {
									return folder.id === targetFolder.id;
								});
							if (!newLastFolderIsInCurrentFolderHierarchy) {
								newHierarchyItems.push(targetFolder);
							} else {
								let foundNewLastFolderInHierarchy = false;
								while (!foundNewLastFolderInHierarchy) {
									const removedFolder =
										newHierarchyItems.pop();
									foundNewLastFolderInHierarchy =
										removedFolder?.id === targetFolder.id;
								}
								newHierarchyItems.push(targetFolder);
							}
						}

						setBrowseRequestState({
							folder: targetFolder,
							hierarchyItems: newHierarchyItems,
							items: result.items,
							name: 'successful',
						});

						hierarchyItems.current = newHierarchyItems;
					},
					(error) => {
						if (
							currentBrowseRequestToken.current !== token ||
							!error
						) {
							// Modal is already closed or the old request was cancelled, wait for the newer one.
							return;
						}

						// If we cannot find the folder to browse, we get a 404,
						if (
							(error as CmsClientError).status === 404 &&
							targetFolder.id !== rootHierarchyItem.id
						) {
							// browse the root folder / hierarchy item instead.
							void browse(
								browseContextDocumentId,
								rootHierarchyItem,
								false,
								[]
							);
							return;
						}

						setBrowseRequestState({
							errorMessage: getErrorMessage(error),
							folder: targetFolder,
							hierarchyItems: oldHierarchyItems,
							name: 'errored',
						});

						hierarchyItems.current = [rootHierarchyItem];
					}
				);
		},
		[
			config.assetTypes,
			config.resultTypes,
			context.query,
			rootHierarchyItem,
		]
	);

	useEffect(() => {
		if (lastOpenedHierarchyItems.length > 0) {
			void browse(
				context.remoteDocumentId,
				lastOpenedHierarchyItems[lastOpenedHierarchyItems.length - 1],
				false,
				lastOpenedHierarchyItems
			);
		} else {
			void browse(context.remoteDocumentId);
		}
	}, [
		browse,
		context.remoteDocumentId,
		currentSelectedItemIdRef,
		lastOpenedHierarchyItems,
	]);

	return {
		browse,
		browseRequestState,
		deleteErrorForItem,
		hasErrorForItem,
		setErrorForItem,
	};
}
