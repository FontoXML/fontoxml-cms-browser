import dataProviders from './dataProviders';

export default function refreshItems(
	breadcrumbItems,
	browseContextDocumentId,
	dataProviderName,
	folderToLoad,
	initialSelectedFileId,
	onItemSelect,
	onUpdateInitialSelectedFileId,
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
				let selectedFile = null;
				if (
					initialSelectedFileId &&
					prevSelectedItem &&
					prevSelectedItem.type !== 'folder'
				) {
					// An other file was selected so the initialSelectedFileId is no longer cached
					onUpdateInitialSelectedFileId(null);
				} else if (initialSelectedFileId) {
					// If the initial selected file is in this folder, it should be selected
					selectedFile =
						result.items.find(item => item.id === initialSelectedFileId) || null;
				}
				onItemSelect(selectedFile);

				onUpdateItems(result.items, result.hierarchyItems || [], {});
			},
			error => {
				if (!error) {
					// The old request was cancelled, wait for the newer one.
					return;
				}

				onUpdateRequest({ type: 'browse', error: error });
				// Keep using the last good state (with previous folderContents, folderHierarchy, selectedFileOrFolder and lastLoadedFolder)
			}
		);
}
