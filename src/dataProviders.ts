import createDataProviderUsingConfiguredConnectors from './data-providers/createDataProviderUsingConfiguredConnectors';

const dataProvidersByName = Object.create(null);

export default {
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
	set(name: $TSFixMeAny, options: $TSFixMeAny): void {
		dataProvidersByName[name] =
			createDataProviderUsingConfiguredConnectors(options);
	},

	get(name: $TSFixMeAny): $TSFixMeAny {
		const dataProvider = dataProvidersByName[name];

		if (!dataProvider) {
			const names = Object.keys(dataProvidersByName)
				.map(function (name) {
					return `"${name}"`;
				})
				.join(', ');

			throw new Error(
				`No dataProvider set with name: "${name}". Known dataProvider names are: ${names}`
			);
		}

		return dataProvider;
	},
};
