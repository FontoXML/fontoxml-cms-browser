define([
], function (
) {
	'use strict';

	var dataProvidersByName = Object.create(null);

	return {
		set: function (name, dataProvider) {
			dataProvidersByName[name] = dataProvider;
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
