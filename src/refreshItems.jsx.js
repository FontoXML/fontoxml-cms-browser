import t from 'fontoxml-localization/t';
import dataProviders from './dataProviders';

export const rootFolder = { label: t('My Drives'), type: 'folder', id: null, value: null };

function updateFolderHierarchy(folderHierarchy, newLastFolderInHierarchy) {
	const updatedFolderHierarchy = folderHierarchy.slice();
	const newLastFolderIsInCurrentFolderHierarchy = folderHierarchy.some(
		folder => folder === newLastFolderInHierarchy
	);
	if (!newLastFolderIsInCurrentFolderHierarchy) {
		updatedFolderHierarchy.push(newLastFolderInHierarchy);
		return updatedFolderHierarchy;
	}

	let foundNewLastFolderInHierarchy = false;
	while (!foundNewLastFolderInHierarchy) {
		const removedFolder = updatedFolderHierarchy.pop();
		foundNewLastFolderInHierarchy = removedFolder === newLastFolderInHierarchy;
	}

	updatedFolderHierarchy.push(newLastFolderInHierarchy);

	return updatedFolderHierarchy;
}

export default function refreshItems(props, folderToLoad, noCache) {
	const {
		breadcrumbItems,
		data: { browseContextDocumentId, dataProviderName },
		initialSelectedFileId,
		onItemSelect,
		onUpdateInitialSelectedFileId,
		onUpdateItems,
		onUpdateRequest,
		selectedItem
	} = props;

	onUpdateRequest({ type: 'browse', busy: true });

	const dataProvider = dataProviders.get(dataProviderName);

	const getItems = () =>
		browseContextDocumentId
			? dataProvider.getFolderContents(
					browseContextDocumentId,
					rootFolder,
					folderToLoad.id,
					noCache
				)
			: dataProvider.getFolderContents(rootFolder, folderToLoad.id, noCache);

	return getItems().then(
		result => {
			onUpdateItems(
				result.items.map(item => ({ ...item, value: item.id })),
				(result.metadata &&
					result.metadata.hierarchy.map(item => ({ ...item, value: item.id }))) ||
					updateFolderHierarchy(breadcrumbItems, folderToLoad),
				false
			);

			let selectedFile = null;
			if (initialSelectedFileId && selectedItem && selectedItem.type !== 'folder') {
				// An other file was selected so the initialSelectedFileId is no longer cached
				onUpdateInitialSelectedFileId(null);
			} else if (initialSelectedFileId) {
				// If the initial selected file is in this folder, it should be selected
				selectedFile = result.items.find(item => item.id === initialSelectedFileId);
				selectedFile = selectedFile ? { ...selectedFile, value: selectedFile.id } : null;
			}
			onItemSelect(selectedFile);
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
