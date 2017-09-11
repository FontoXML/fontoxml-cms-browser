import dataProviders from './dataProviders';

// TODO: inline this in withModularBrowserCapabilities
export default function refreshItems(
	// TODO: rename to hierarchyItems
	breadcrumbItems,
	browseContextDocumentId,
	dataProviderName,
	folderToLoad,
	initialSelectedItemId,
	onItemSelect,
	// TODO: unused, remove this
	onUpdateInitialSelectedItemId,
	// TODO: rename to onItemsChange
	onUpdateItems,
	// TODO: check if this should be implemented as a callback, rename to onRequestStateChange if it does
	onUpdateRequest,
	// TODO: unused, remove this
	prevSelectedItem,
	noCache
) {
	onUpdateRequest({ type: 'browse', busy: true });

	const dataProvider = dataProviders.get(dataProviderName);

	return dataProvider
		.getFolderContents(browseContextDocumentId, folderToLoad, {
			hierarchyItems: breadcrumbItems,
			noCache
		})
		.then(
			result => {
				// Because of jump in the tree with browse context document id,
				// the folder that is actually loaded could be different from the folderToLoad.
				let newSelectedItem =
					result.hierarchyItems[result.hierarchyItems.length - 1] || folderToLoad;

				// If the rootFolder is the folder to load, the newSelectedItem is null
				newSelectedItem = newSelectedItem.id === null ? null : newSelectedItem;

				if (initialSelectedItemId) {
					// If the initial selected item is in this folder, it should be selected
					newSelectedItem =
						result.items.find(item => item.id === initialSelectedItemId) || null;
				}
				onItemSelect(newSelectedItem);

				onUpdateItems(result.items, result.hierarchyItems || [], {});
				return result.items;
			},
			error => {
				if (!error) {
					// The old request was cancelled, wait for the newer one.
					return;
				}

				onItemSelect(null);
				onUpdateRequest({ type: 'browse', error: error });
			}
		);
}
