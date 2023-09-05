import connectorsManager from 'fontoxml-configuration/src/connectorsManager';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import selectionManager from 'fontoxml-selection/src/selectionManager';

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

export type DataProviderUsingConfiguredConnectors = {
	getFolderContents(
		browseContextDocumentId: $TSFixMeAny,
		targetFolder: $TSFixMeAny,
		noCache: $TSFixMeAny,
		hierarchyItems: $TSFixMeAny,
		additionalQueryProperties: $TSFixMeAny
	): $TSFixMeAny;
	getRootHierarchyItem(): { id: $TSFixMeAny; label: string; type: string };
	upload(
		folderToUploadInId: $TSFixMeAny,
		filesToUpload: $TSFixMeAny
	): $TSFixMeAny;
	getUploadOptions(): $TSFixMeAny;
	_lastOpenedState: {
		hierarchyItems: $TSFixMeAny[];
		selectedItem: $TSFixMeAny;
	};
	storeLastOpenedState(hierarchyItems: $TSFixMeAny[]): $TSFixMeAny;
	getLastOpenedState(): $TSFixMeAny;
};

/**
 * @param options -
 */
export default function createDataProviderUsingConfiguredConnectors(options: {
	assetTypes: string[];
	resultTypes: string[];
	rootFolderLabel: string;
	query: Object;
	uploadAssetType: string;
	uploadMimeTypesToAccept: string;
	uploadMaxFileSizeInBytes: number;
}): DataProviderUsingConfiguredConnectors {
	return {
		/**
		 * @param browseContextDocumentId -
		 * @param targetFolder            -
		 * @param noCache                 -
		 * @param hierarchyItems          -
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
		 * @param folderToUploadInId -
		 * @param filesToUpload      - TODO: what type does this resolve to?
		 */
		upload(folderToUploadInId, filesToUpload) {
			return upload(options, folderToUploadInId, filesToUpload);
		},

		getUploadOptions() {
			return getUploadOptions(options);
		},

		_lastOpenedState: { hierarchyItems: null, selectedItem: null },
		/**
		 * @remarks
		 * Stores the last opened hierarchyItems. Used to restore this state whenever the
		 * browse modal for this data provider is opened again.
		 *
		 * @param hierarchyItems -
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
