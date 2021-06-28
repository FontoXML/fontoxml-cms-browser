import connectorsManager from 'fontoxml-configuration/src/connectorsManager';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import selectionManager from 'fontoxml-selection/src/selectionManager';
import type { DataProvider } from 'fontoxml-typescript-migration-debt/src/types';

const configuredAssetConnector =
	connectorsManager.getConnector('asset-connector');
const configuredBrowseConnector =
	connectorsManager.getConnector('browse-connector');

function updateFolderHierarchy(
	folderHierarchy: $TSFixMeAny,
	newLastFolderInHierarchy: $TSFixMeAny
): $TSFixMeAny {
	const updatedFolderHierarchy = folderHierarchy.slice();
	const newLastFolderIsInCurrentFolderHierarchy = folderHierarchy.some(
		function (folder) {
			return folder.id === newLastFolderInHierarchy.id;
		}
	);
	if (!newLastFolderIsInCurrentFolderHierarchy) {
		updatedFolderHierarchy.push(newLastFolderInHierarchy);
		return updatedFolderHierarchy;
	}

	let foundNewLastFolderInHierarchy = false;
	while (!foundNewLastFolderInHierarchy) {
		const removedFolder = updatedFolderHierarchy.pop();
		foundNewLastFolderInHierarchy =
			removedFolder.id === newLastFolderInHierarchy.id;
	}

	updatedFolderHierarchy.push(newLastFolderInHierarchy);

	return updatedFolderHierarchy;
}

function getFolderContents(
	options: $TSFixMeAny,
	browseContextDocumentId: $TSFixMeAny,
	targetFolder: $TSFixMeAny,
	noCache: $TSFixMeAny,
	hierarchyItems: $TSFixMeAny,
	additionalQueryProperties: $TSFixMeAny
): $TSFixMeAny {
	const query = { ...options.query, ...additionalQueryProperties };
	return configuredBrowseConnector
		.browse(
			browseContextDocumentId,
			options.assetTypes,
			options.resultTypes,
			targetFolder.id,
			Object.keys(query).length ? query : null,
			null,
			null,
			noCache
		)
		.then(function (result) {
			const newHierarchyItems =
				(result.metadata && result.metadata.hierarchy) ||
				updateFolderHierarchy(hierarchyItems || [], {
					...targetFolder,
					...(targetFolder.id === null
						? { label: options.rootFolderLabel }
						: {}),
				});

			return {
				hierarchyItems: newHierarchyItems,
				items: result.items.map(function (item) {
					if (!item.metadata) {
						return item;
					}
					// TODO: why don't we just use item.metadata.x to access these later?
					return {
						...item,
						icon: item.metadata.icon,
						isDisabled: item.metadata.isDisabled,
						// Description for preview of document (template)
						description: item.metadata.description,
					};
				}),
			};
		});
}

function upload(
	options: $TSFixMeAny,
	folderToUploadInId: $TSFixMeAny,
	filesToUpload: $TSFixMeAny
): $TSFixMeAny {
	return configuredAssetConnector.upload(
		documentsManager.getRemoteDocumentId(
			selectionManager.focusedDocumentId
		),
		filesToUpload[0],
		options.uploadAssetType,
		{},
		folderToUploadInId
	);
}

function getUploadOptions(options: $TSFixMeAny): $TSFixMeAny {
	return {
		mimeTypesToAccept: options.uploadMimeTypesToAccept,
		maxFileSizeInBytes: options.uploadMaxFileSizeInBytes,
	};
}

/**
 * @param {{
 *   assetTypes: string[],
 *   resultTypes: string[],
 *   rootFolderLabel: string,
 *   query: Object,
 *   uploadAssetType: string,
 *   uploadMimeTypesToAccept: string,
 *   uploadMaxFileSizeInBytes: number
 * }} options
 *
 * @return {DataProvider}
 */
export default function createDataProviderUsingConfiguredConnectors(options: {
	assetTypes: string[];
	resultTypes: string[];
	rootFolderLabel: string;
	query: Object;
	uploadAssetType: string;
	uploadMimeTypesToAccept: string;
	uploadMaxFileSizeInBytes: number;
}): DataProvider {
	return {
		/**
		 * @param {string} browseContextDocumentId
		 * @param {object} targetFolder
		 * @param {boolean} noCache
		 * @param {object[]} hierarchyItems
		 *
		 * @return {Promise<{
		 *   hierarchyItems: string[]
		 *   items: { id: string, label: string, icon: string, isDisabled: Boolean, externalUrl: string }[]
		 * }>}
		 */
		getFolderContents(
			browseContextDocumentId,
			targetFolder,
			noCache,
			hierarchyItems,
			additionalQueryProperties
		) {
			return getFolderContents(
				options,
				browseContextDocumentId,
				targetFolder,
				noCache,
				hierarchyItems,
				additionalQueryProperties
			);
		},

		getRootHierarchyItem() {
			return { id: null, label: options.rootFolderLabel, type: 'folder' };
		},

		/**
		 * @param {string} folderToUploadInId
		 * @param {File[]} filesToUpload
		 *
		 * TODO: what type does this resolve to?
		 * @return {Promise}
		 */
		upload(folderToUploadInId, filesToUpload) {
			return upload(options, folderToUploadInId, filesToUpload);
		},

		/**
		 * @return {{ mimeTypesToAccept: string, maxFileSizeInBytes: number }}
		 */
		getUploadOptions() {
			return getUploadOptions(options);
		},

		_lastOpenedState: { hierarchyItems: null, selectedItem: null },
		/**
		 * Stores the last opened hierarchyItems.
		 * Used to restore this state whenever the browse modal for this data provider is
		 * opened again.
		 *
		 * @param {object[]} hierarchyItems
		 */
		storeLastOpenedState(hierarchyItems) {
			this._lastOpenedState = {
				hierarchyItems,
			};
		},

		getLastOpenedState() {
			return this._lastOpenedState;
		},
	};
}
