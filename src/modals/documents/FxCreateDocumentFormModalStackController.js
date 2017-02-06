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

	/* @ngInject */ function FxCreateDocumentFormModalStackController ($scope, operationData) {
		selectionManager.preventEditorFocus();

		reactToAngularModalBridge.operationData = operationData;

		reactToAngularModalBridge.closeModal = function closeModal () {
			selectionManager.allowEditorFocus();

			$scope.$dismiss();
		};

		reactToAngularModalBridge.onModalSubmit = function onModalSubmit (modalData) {
			$scope.$close(Object.assign({}, operationData, {
				selectedDocumentTemplateId: modalData.selectedDocumentTemplate.id,
				selectedFolderId: modalData.selectedFolder.id,
				documentTitle: modalData.documentTitle
			}));
		};
	}

	return FxCreateDocumentFormModalStackController;
});
