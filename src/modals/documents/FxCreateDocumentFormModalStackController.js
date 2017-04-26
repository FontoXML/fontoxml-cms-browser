define([
	'fontoxml-selection/selectionManager',

	'../../reactToAngularModalBridge'
], function (
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
			selectionManager.allowEditorFocus();

			$scope.$close(Object.assign({}, operationData, {
				selectedDocumentTemplateId: modalData.selectedDocumentTemplate.id,
				selectedFolderId: modalData.selectedFolder.id,
				documentTitle: modalData.documentTitle
			}));
		};
	}

	return FxCreateDocumentFormModalStackController;
});
