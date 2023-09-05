import createDataProviderUsingConfiguredConnectors, { DataProviderUsingConfiguredConnectors } from './data-providers/createDataProviderUsingConfiguredConnectors';

const dataProvidersByName = Object.create(null);

const dataProviders = {
	/**
	 * @remarks
	 * Set a data provider that can be used by the cms browser modals.
	 *
	 * @fontosdk
	 *
	 * @param name    -
	 * @param options -
	 */
	set(name: $TSFixMeAny, options: $TSFixMeAny): void {
		dataProvidersByName[name] =
			createDataProviderUsingConfiguredConnectors(options);
	},

	get(name: $TSFixMeAny): DataProviderUsingConfiguredConnectors {
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

export default dataProviders;
