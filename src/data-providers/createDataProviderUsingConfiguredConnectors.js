define([
	'fontoxml-configuration/get!asset-connector',
	'fontoxml-configuration/get!browse-connector',

	'fontoxml-documents/documentsManager',
	'fontoxml-selection/selectionManager'
], function (
	configuredAssetConnector,
	configuredBrowseConnector,

	documentsManager,
	selectionManager
) {
	'use strict';

	function updateFolderHierarchy (folderHierarchy, newLastFolderInHierarchy) {
		var updatedFolderHierarchy = folderHierarchy.slice();
		var newLastFolderIsInCurrentFolderHierarchy = folderHierarchy.some(function (folder) {
			return folder.id === newLastFolderInHierarchy.id;
		});
		if (!newLastFolderIsInCurrentFolderHierarchy) {
			updatedFolderHierarchy.push(newLastFolderInHierarchy);
			return updatedFolderHierarchy;
		}

		var foundNewLastFolderInHierarchy = false;
		while (!foundNewLastFolderInHierarchy) {
			var removedFolder = updatedFolderHierarchy.pop();
			foundNewLastFolderInHierarchy = removedFolder.id === newLastFolderInHierarchy.id;
		}

		updatedFolderHierarchy.push(newLastFolderInHierarchy);

		return updatedFolderHierarchy;
	}

	function getFolderContents (options, browseContextDocumentId, targetFolder, noCache, hierarchyItems) {
		return configuredBrowseConnector.browse(
			browseContextDocumentId,
			options.assetTypes,
			options.resultTypes,
			targetFolder.id,
			options.query || null,
			null,
			null,
			noCache
		)
			.then(function (result) {
				var newHierarchyItems = (result.metadata && result.metadata.hierarchy) || updateFolderHierarchy(
					hierarchyItems || [],
					Object.assign({}, targetFolder, targetFolder.id === null ? { label: options.rootFolderLabel } : {})
				);

				return {
					hierarchyItems: newHierarchyItems,
					items: result.items.map(function (item) {
						if (!item.metadata) {
							return item;
						}
						// TODO: why don't we just use item.metadata.x to access these later?
						return Object.assign({}, item, {
							icon: item.metadata.icon,
							isDisabled: item.metadata.isDisabled,
							// Description for preview of document (template)
							description: item.metadata.description
						});
					})
				};
			});
	}

	function upload (options, folderToUploadInId, filesToUpload) {
		return configuredAssetConnector.upload(
			documentsManager.getRemoteDocumentId(selectionManager.focusedDocumentId),
			filesToUpload[0],
			options.uploadAssetType,
			{},
			folderToUploadInId
		);
	}


	function getUploadOptions (options) {
		return {
			mimeTypesToAccept: options.uploadMimeTypesToAccept,
			maxFileSizeInBytes: options.uploadMaxFileSizeInBytes
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
	return function createDataProviderUsingConfiguredConnectors (options) {
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
			getFolderContents: function (browseContextDocumentId, targetFolder, noCache, hierarchyItems) {
				return getFolderContents(options, browseContextDocumentId, targetFolder, noCache, hierarchyItems);
			},

			/**
			 * @param {string} folderToUploadInId
			 * @param {File[]} filesToUpload
			 *
			 * TODO: what type does this resolve to?
			 * @return {Promise}
			 */
			upload: function (folderToUploadInId, filesToUpload) {
				return upload(options, folderToUploadInId, filesToUpload);
			},

			/**
			 * @return {{ mimeTypesToAccept: string, maxFileSizeInBytes: number }}
			 */
			getUploadOptions: function () {
				return getUploadOptions(options);
			}
		};
	};
});
