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

	/* @ngInject */ function FxOpenOrCreateDocumentModalStackController ($scope, operationData) {
		selectionManager.preventEditorFocus();

		reactToAngularModalBridge.operationData = operationData;

		reactToAngularModalBridge.closeModal = function closeModal () {
			selectionManager.allowEditorFocus();

			$scope.$dismiss();
		};

		reactToAngularModalBridge.onModalSubmit = function onModalSubmit (modalData) {
			selectionManager.allowEditorFocus();

			if (modalData.activeTabId === 'create') {
				$scope.$close(Object.assign({}, operationData, {
					selectedDocumentTemplateId: modalData.selectedDocumentTemplate.id,
					selectedFolderId: modalData.selectedFolder.id,
					documentTitle: modalData.documentTitle
				}));
			}
			else if (modalData.activeTabId === 'open') {
				$scope.$close(Object.assign({}, operationData, { documentRemoteId: modalData.selectedDocument.id }));
			}
		};
	}

	return FxOpenOrCreateDocumentModalStackController;
});
