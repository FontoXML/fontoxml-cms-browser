define([
	'fontoxml-documents/documentsManager',
	'fontoxml-selection/selectionManager',

	'../../reactToAngularModalBridge'
], function (
	documentsManager,
	selectionManager,

	reactToAngularModalBridge
) {
	'use strict';

	/* @ngInject */ function FxOpenDocumentBrowserModalController ($scope, operationData) {
		selectionManager.preventEditorFocus();

		reactToAngularModalBridge.operationData = operationData;

		reactToAngularModalBridge.closeModal = function closeModal () {
			selectionManager.allowEditorFocus();

			$scope.$dismiss();
		};
		reactToAngularModalBridge.onModalSubmit = function onModalSubmit (modalData) {
			selectionManager.allowEditorFocus();

			$scope.$close(Object.assign({}, operationData, {
				documentId: documentsManager.getDocumentIdByRemoteDocumentId(modalData.selectedDocument.id),
				documentRemoteId: modalData.selectedDocument.id
			}));
		};
	}

	return FxOpenDocumentBrowserModalController;
});
