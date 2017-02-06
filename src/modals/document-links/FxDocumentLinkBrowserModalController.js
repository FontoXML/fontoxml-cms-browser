define([
	'fontoxml-selection/selectionManager',

	'../../reactToAngularModalBridge'
], function (
	selectionManager,

	reactToAngularModalBridge
) {
	'use strict';

	/* @ngInject */ function FxDocumentLinkBrowserModalController ($scope, operationData) {
		selectionManager.preventEditorFocus();

		reactToAngularModalBridge.operationData = Object.assign({}, operationData, { linkableElementsQuery: '//*[@id]' });

		reactToAngularModalBridge.closeModal = function closeModal () {
			selectionManager.allowEditorFocus();

			$scope.$dismiss();
		};
		reactToAngularModalBridge.onModalSubmit = function onModalSubmit (modalData) {
			selectionManager.allowEditorFocus();

			var newOperationData = {
				remoteDocumentId: modalData.selectedLink.remoteDocumentId,
				documentId: modalData.selectedLink.documentId,
				nodeId: modalData.selectedLink.nodeId
			};

			$scope.$close(Object.assign({}, operationData, newOperationData));
		};
	}

	return FxDocumentLinkBrowserModalController;
});
