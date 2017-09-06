import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import domQuery from 'fontoxml-dom-utils/domQuery';
import evaluateXPathToNodes from 'fontoxml-selectors/evaluateXPathToNodes';
import View from 'fontoxml-views/View';

const LINKABLE_ELEMENT_ATTRIBUTE_NAME = 'cv-is-linkable-element';
const SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME = 'cv-is-linkable-element-and-selected';

// TODO: Use node highlight manager to simplify highlights when that supports the viewName argument
// (this would still implement the click toggle)
function LinkSelectorOverlayView (viewRootNode, templatedView, linkableElementsQuery, initialSelectedLink, onSelectedLinkableElementChange) {
	View.call(this);

	this._templatedView = templatedView;
	this._linkableElementsQuery = linkableElementsQuery;
	this._initialSelectedLink = initialSelectedLink;

	this._initialSelectedLinkProcessed = false;
	this._linkableElementsViewNodes = [];
	this._selectedLinkableElementViewNode = null;

	this._isUpdating = false;
	this._updateLinkableElements = () => {
		if (this._isUpdating) {
			return;
		}

		this._isUpdating = true;
		templatedView.mutationLock.unlock(() => {
			const document = templatedView.getDocument();
			const documentElement = document.dom.documentNode.documentElement;

			const linkableElements = linkableElementsQuery ?
				evaluateXPathToNodes(linkableElementsQuery, documentElement, readOnlyBlueprint) :
				[ documentElement ];

			const linkableElementsViewNodes = linkableElements
				.map((linkableElement) => viewRootNode.querySelectorAll(`[node-id="${getNodeId(linkableElement)}"]`))
				.reduce((combinedViewNodes, linkableElementViewNodes) => {
					return combinedViewNodes.concat(Array.from(linkableElementViewNodes));
				}, []);

			let foundSelectedViewNode = false;
			linkableElementsViewNodes.forEach((viewNode) => {
				viewNode.setAttribute(LINKABLE_ELEMENT_ATTRIBUTE_NAME, '');

				// The view node for the selected node may have changed, look for a new one
				// TODO: support multiple view nodes per node
				if (!this._selectedLinkableElementViewNode || foundSelectedViewNode) {
					return;
				}

				if (viewNode.getAttribute('node-id') === this._selectedLinkableElementViewNode.getAttribute('node-id')) {
					viewNode.setAttribute(SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME, '');
					this._selectedLinkableElementViewNode = viewNode;
					foundSelectedViewNode = true;
				}
			});

			this._linkableElementsViewNodes = linkableElementsViewNodes;

			// TODO: is the code below really necessary?

			if (this._initialSelectedLinkProcessed) {
				return;
			}
			this._initialSelectedLinkProcessed = true;

			let initialSelectedLinkNodeId = null;
			if (this._initialSelectedLink && this._initialSelectedLink.nodeId) {
				initialSelectedLinkNodeId = this._initialSelectedLink.nodeId;
			}
			else if (!this._linkableElementsQuery || linkableElements.includes(documentElement)) {
				initialSelectedLinkNodeId = getNodeId(documentElement);
			}

			if (!initialSelectedLinkNodeId) {
				return;
			}

			this._selectedLinkableElementViewNode = this._linkableElementsViewNodes
				.find((viewNode) => viewNode.getAttribute('node-id') === initialSelectedLinkNodeId);
			if (this._selectedLinkableElementViewNode) {
				this._selectedLinkableElementViewNode.setAttribute(SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME, '');

				onSelectedLinkableElementChange(initialSelectedLinkNodeId);
			}
		});
		this._isUpdating = false;
	};

	this._handleLinkableElementClick = (event) => {
		event.stopPropagation();

		templatedView.mutationLock.unlock(() => {
			const newSelectedLinkableElementViewNode = domQuery.findClosestAncestor(
				event.target,
				(element) => element.getAttribute && element.getAttribute(LINKABLE_ELEMENT_ATTRIBUTE_NAME) !== null
			);

			if (!newSelectedLinkableElementViewNode ||
				newSelectedLinkableElementViewNode === this._selectedLinkableElementViewNode) {
				return;
			}

			if (this._selectedLinkableElementViewNode) {
				this._selectedLinkableElementViewNode.removeAttribute(SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME);
			}

			this._selectedLinkableElementViewNode = newSelectedLinkableElementViewNode;
			this._selectedLinkableElementViewNode.setAttribute(SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME, '');

			onSelectedLinkableElementChange(this._selectedLinkableElementViewNode.getAttribute('node-id'));
		});
	};
	viewRootNode.addEventListener('click', this._handleLinkableElementClick);
	viewRootNode.addEventListener('unlockedviewmutation', this._updateLinkableElements);
}

LinkSelectorOverlayView.prototype = Object.create(View.prototype);
LinkSelectorOverlayView.prototype.constructor = LinkSelectorOverlayView;

LinkSelectorOverlayView.prototype.loadDocument = function (documentController) {
	View.prototype.loadDocument.call(this, documentController);

	this._updateLinkableElements();
};

LinkSelectorOverlayView.prototype.unloadDocument = function () {
	this._linkableElementsViewNodes = [];
	this._selectedLinkableElementViewNode = null;

	View.prototype.unloadDocument.call(this);
};

LinkSelectorOverlayView.prototype.update = function () {
	this._updateLinkableElements();
};

LinkSelectorOverlayView.prototype.destroy = function () {
	this._linkableElementsViewNodes = [];
	this._selectedLinkableElementViewNode = null;

	View.prototype.destroy.call(this);
};

export default LinkSelectorOverlayView;
