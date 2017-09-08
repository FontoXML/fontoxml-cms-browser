import dataProviders from './dataProviders';

export default function refreshItems(
	breadcrumbItems,
	browseContextDocumentId,
	dataProviderName,
	folderToLoad,
	initialSelectedItemId,
	onItemSelect,
	onUpdateInitialSelectedItemId,
	onUpdateItems,
	onUpdateRequest,
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
				let initialSelectedItem = null;
				if (
					initialSelectedItemId &&
					prevSelectedItem &&
					prevSelectedItem.type !== 'folder'
				) {
					// An other item (that is not a folder) was selected so the initialSelectedItemId is no longer cached
					onUpdateInitialSelectedItemId(null);
				} else if (initialSelectedItemId) {
					// If the initial selected item is in this folder, it should be selected
					initialSelectedItem =
						result.items.find(item => item.id === initialSelectedItemId) || null;
				}
				onItemSelect(initialSelectedItem);

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
