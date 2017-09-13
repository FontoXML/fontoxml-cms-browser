define([
	'fontoxml-configuration/configurationManager'
], function (
	configurationManager
) {
	'use strict';

	return function setDefaultConfiguration () {
		configurationManager.setDefault('cms-browser-uses-cms-hierarchy-information', false);
	};
});
