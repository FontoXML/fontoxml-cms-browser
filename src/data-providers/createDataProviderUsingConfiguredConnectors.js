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

	function getFolderContents (options, browseContextDocumentId, rootFolder, targetFolderId, noCache) {
		return configuredBrowseConnector.browse(
			browseContextDocumentId,
			options.assetTypes,
			options.resultTypes,
			targetFolderId,
			null,
			null,
			null,
			noCache
		)
			.then(function (result) {
				var hierarchy = (result.metadata && result.metadata.hierarchy ? result.metadata.hierarchy : [ rootFolder ])
					.map(function (folder) {
						return folder.id === null ? rootFolder : folder;
					});

				return {
					metadata: Object.assign({}, result.metadata, { hierarchy: hierarchy }),
					items: result.items.map(function (item) {
						return Object.assign({}, item, {
							icon: item.metadata.icon,
							isInvalid: item.metadata.isDisabled
						});
					})
				}
			});
	}

	function upload (options, folderToUploadInId, filesToUpload) {
		const documentFile = documentsManager.getDocumentFile(selectionManager.focusedDocumentId);
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
	 *   assetTypes: Array.<String>,
	 *   resultTypes: Array.<String>,
	 *   uploadAssetType: String,
	 *   uploadMimeTypesToAccept: String,
	 *   uploadMaxFileSizeInBytes: Number
	 * }} options
	 */
	return function createDataProviderUsingConfiguredConnectors (options) {
		return {
			/**
			 * @param {String} browseContextDocumentId
			 * @param {{id: String}} rootFolder
			 * @param {String} targetFolderId
			 * @param {Boolean} noCache
			 * @return {Promise.<{
			 *   metadata: {
			 *     hierarchy: Array.<String>
			 *   },
			 *   items: Array.<{ id: String, label: String, icon: String, isInvalid: Boolean }>
			 * }>}
			 */
			getFolderContents: function (browseContextDocumentId, rootFolder, targetFolderId, noCache) {
				return getFolderContents(options, browseContextDocumentId, rootFolder, targetFolderId, noCache);
			},

			/**
			 * @param {String} folderToUploadInId
			 * @param {Array.<File>} filesToUpload
			 */
			upload: function (folderToUploadInId, filesToUpload) {
				return upload(options, folderToUploadInId, filesToUpload);
			},

			/**
			 * @return {{ mimeTypesToAccept: String, maxFileSizeInBytes: Number }}
			 */
			getUploadOptions: function () {
				return getUploadOptions(options);
			}
		};
	};
});
