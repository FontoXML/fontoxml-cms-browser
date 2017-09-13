define([
	'fontoxml-configuration/get!asset-connector',
	'fontoxml-configuration/get!browse-connector',
	'fontoxml-configuration/get!cms-browser-uses-cms-hierarchy-information',

	'fontoxml-documents/documentsManager',
	'fontoxml-selection/selectionManager'
], function (
	configuredAssetConnector,
	configuredBrowseConnector,
	configuredUseHierarchyInformation,

	documentsManager,
	selectionManager
) {
	'use strict';

	function updateFolderHierarchy (folderHierarchy, newLastFolderInHierarchy) {
		const updatedFolderHierarchy = folderHierarchy.slice();
		const newLastFolderIsInCurrentFolderHierarchy = folderHierarchy.some(
			folder => folder.id === newLastFolderInHierarchy.id
		);
		if (!newLastFolderIsInCurrentFolderHierarchy) {
			updatedFolderHierarchy.push(newLastFolderInHierarchy);
			return updatedFolderHierarchy;
		}

		let foundNewLastFolderInHierarchy = false;
		while (!foundNewLastFolderInHierarchy) {
			const removedFolder = updatedFolderHierarchy.pop();
			foundNewLastFolderInHierarchy = removedFolder.id === newLastFolderInHierarchy.id;
		}

		updatedFolderHierarchy.push(newLastFolderInHierarchy);

		return updatedFolderHierarchy;
	}

	function getFolderContents (options, browseContextDocumentId, targetFolder, additionalOptions) {
		return configuredBrowseConnector.browse(
			documentsManager.getDocumentFile(browseContextDocumentId),
			options.assetTypes,
			options.resultTypes,
			targetFolder.id,
			null,
			null,
			null,
			// Disable cache when using hierarchy information
			// TODO: why?
			configuredUseHierarchyInformation
		)
			.then(function (result) {
				var hierarchyItems = configuredUseHierarchyInformation ?
					result.metadata.hierarchy :
					updateFolderHierarchy(
						additionalOptions.hierarchyItems || [],
						Object.assign({}, targetFolder, targetFolder.id === null ? { label: options.rootFolderLabel } : {})
					);

				return {
					hierarchyItems: hierarchyItems,
					items: result.items.map(function (item) {
						// TODO: why don't we just use item.metadata.x to access these later?
						return Object.assign({}, item, {
							icon: item.metadata.icon,
							isDisabled: item.metadata.isDisabled
						});
					})
				};
			});
	}

	function upload (options, folderToUploadInId, filesToUpload) {
		var documentFile = documentsManager.getDocumentFile(selectionManager.focusedDocumentId);
		return configuredAssetConnector.upload(
			documentFile,
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
			 * @param {Object} additionalOptions
			 * @return {Promise<{
			 *   hierarchyItems: string[]
			 *   items: { id: string, label: string, icon: string, isDisabled: Boolean, externalUrl: string }[]
			 * }>}
			 */
			getFolderContents: function (browseContextDocumentId, targetFolder, additionalOptions) {
				return getFolderContents(options, browseContextDocumentId, targetFolder, additionalOptions);
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
