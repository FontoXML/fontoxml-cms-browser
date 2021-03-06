---
category: add-on/fontoxml-cms-browser
---

# CMS browser library

This add-on exposes operations for opening CMS related browsers. These browsers allow the user to browse documents and images present on the used CMS.

## Getting started

This add-on can be added to an editor by selecting it in the list of add-ons available on the SDK portal. This can then be installed as usual.

---

## Usage of open-document-with-link-selector-browser-modal

The {@link operation/open-document-with-link-selector-browser-modal} operation is used to open the document with link selector browser. This browser allows the user to select an element in a document.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-document-with-link-selector-browser-modal"
}
```

-   The elements which should be selectable by the user can be set by providing a `linkableElementsQuery`. This is an {@link XPathQuery}.
-   Use `dataProviderName` to override the default data provider properties.
-   When this browser is used to edit an existing link, the `documentId` and `nodeId` properties can be used to set the selection on the original document and element.
-   Use `insertOperationName` to disable the primary button based on the operation state.
-   The browser icon, title and primary button label can be set with the `modalIcon`, `modalTitle` and `modalPrimaryButtonLabel` respectively.

For more information, see the {@link operation/open-document-with-link-selector-browser-modal} operation.

---

## Usage of open-image-browser-modal

The {@link operation/open-image-browser-modal} operation is used to open the image browser. This browser allows the user to select an image. This, for example, can be used to insert an image in a document.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-image-browser-modal"
}
```

-   When this browser is being used to edit a reference to an existing image, the `selectedImageId` property can be used to set the selection on the original image.
-   Use `dataProviderName` to override the default data provider properties.
-   Use `insertOperationName` to disable the primary button based on the operation state.
-   The browser icon, title and primary button label can be set with the `modalIcon`, `modalTitle` and `modalPrimaryButtonLabel` respectively.

For more information, see the {@link operation/open-image-browser-modal} operation.

---

## Usage of open-document-browser-modal

The {@link operation/open-document-browser-modal} operation is used to open the document browser. This browser allows the user to select a document. This, for example, can be used to insert a document in a map.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-document-browser-modal"
}
```

-   When this browser is being used to edit a reference to an existing document, the `documentId` property can be used to set the selection on the original document.
-   Use `dataProviderName` to override the default data provider properties.
-   Use `insertOperationName` to disable the primary button based on the operation state.
-   The browser icon, title and primary button label can be set with the `modalIcon`, `modalTitle` and `modalPrimaryButtonLabel` respectively.

For more information, see the {@link operation/open-document-browser-modal} operation.

---

## Usage of open-document-template-browser-modal

The {@link operation/open-document-template-browser-modal} operation is used to open the document
template browser. This browser allows the user to select a document template. This, for example, can
be used to insert a new document in a map.

Note that Ids contained in the template will be regenerated, to ensure they are unique. This means
it is impossible to use these ids in, for instance, crossreferences

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-document-template-browser-modal"
}
```

-   Use `insertOperationName` to disable the primary button based on the operation state.
-   Use `dataProviderName` to override the default data provider properties.
-   The browser icon, title and primary button label can be set with the `modalIcon`, `modalTitle` and `modalPrimaryButtonLabel` respectively.

For more information, see the {@link operation/open-document-template-browser-modal} operation.

---

## Usage of open-open-or-create-document-browser-modal

The {@link operation/open-open-or-create-document-browser-modal} operation is used to open the open or create document browser. This browser allows the user to create a new document or open an existing document.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-open-or-create-document-browser-modal"
}
```

-   Use `insertOperationName` to disable the primary button based on the operation state.
-   Use `openDocumentDataProviderName`, `selectDocumentTemplateDataProviderName` and `selectFolderDataProviderName` to override the default data provider properties.
-   The browser icon and title can be set with the `modalIcon` and `modalTitle` respectively.

For more information, see the {@link operation/open-open-or-create-document-browser-modal} operation.

---

## Usage of open-create-document-form-modal

The {@link operation/open-create-document-form-modal} operation is used to open the create document form modal. This form allows the user to create a new document by choosing a template.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-create-document-form-modal"
}
```

-   Use `insertOperationName` to disable the primary button based on the operation state.
-   Use `selectDocumentTemplateDataProviderName` and `selectFolderDataProviderName` to override the default data provider properties.
-   The browser icon and title can be set with the `modalIcon` and `modalTitle` respectively.

For more information, see the {@link operation/open-create-document-form-modal} operation.

# Contributing

This package can serve as a base for custom versions of the CMS browser. It can be forked by
checking it out directly in the `packages` folder of an editor. When making a fork, consider keeping
it up-to-date with new Fonto Editor versions when they release.

We highly appreciate pull requests if you find a bug. For more general improvements or new features,
please file a [support.fontoxml.com](support request). That way, we can think along and make sure an
improvement is made in a way that benefits all users of this package.
