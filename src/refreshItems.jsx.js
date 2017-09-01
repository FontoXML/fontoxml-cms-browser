import t from 'fontoxml-localization/t';
import dataProviders from './dataProviders';

export const rootFolder = { label: t('My Drives'), type: 'folder', id: null };

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
		onUpdateItems,
		onUpdateRequest,
		onItemSelect
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
				result.items,
				result.metadata.hierarchy || updateFolderHierarchy(breadcrumbItems, folderToLoad),
				false
			);

			onItemSelect(null);
		},
		error => {
			if (!error) {
				// The component is unmounted or the old request was cancelled, wait for the newer one.
				return;
			}

			onUpdateRequest({ type: 'error', error: error });
			// Keep using the last good state (with previous folderContents, folderHierarchy, selectedFileOrFolder and lastLoadedFolder)
		}
	);
}
