define([
	'./data-providers/createDataProviderUsingConfiguredConnectors'
], function (
	createDataProviderUsingConfiguredConnectors
) {
	'use strict';

	var dataProvidersByName = Object.create(null);

	return {
		/**
		 * Set a data provider that can be used by the cms browser modals.
		 *
		 * @fontosdk
		 *
		 * @param {string} name
		 * @param {{
		 *   assetTypes: string[],
		 *   resultTypes: string[],
		 *   rootFolderLabel: string,
		 *   query: Object,
		 *   uploadAssetType: string,
		 *   uploadMimeTypesToAccept: string,
		 *   uploadMaxFileSizeInBytes: number
		 * }} options
		 */
		set: function (name, options) {
			dataProvidersByName[name] = createDataProviderUsingConfiguredConnectors(options);
		},

		get: function (name) {
			var dataProvider = dataProvidersByName[name];

			if (!dataProvider) {
				var names = Object.keys(dataProvidersByName)
					.map(function (name) {
						return '"' + name + '"';
					})
					.join(', ');

				throw new Error('No dataProvider set with name: "' + name + '". Known dataProvider names are: ' + names);
			}

			return dataProvider;
		}
	};
});
