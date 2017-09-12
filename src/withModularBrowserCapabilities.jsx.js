import React, { Component } from 'react';

export default function withModularBrowserCapabilities(
	WrappedComponent,
	loader,
	initialViewMode = null
) {
	return class ModularBrowser extends Component {
		initialSelectedItemId = null;
		// TODO: rename to isMountedInDOM / refactored by Thomas G.
		isComponentMounted = false;

		state = {
			// Contains information on the current/last known request
			// { type: fileLoad|search|browse|upload, ?query, ?error, ?resultCount }
			request: {},

			// Contains the items that the user can choose from
			breadcrumbItems: [],

			// Contains the items that the user can choose from
			items: [],

			// The item that is previewed and would be submitted if the user continues
			selectedItem: null,

			// Contains information for the viewMode, for example list or grid
			viewMode: initialViewMode
		};

		isItemErrored = item => loader.isItemErrored(item.id);

		// Used by any component to change the currently selected item
		onItemSelect = item => this.isComponentMounted && this.setState({ selectedItem: item });

		onUpdateInitialSelectedItemId = itemId => {
			if (this.isComponentMounted) {
				this.initialSelectedItemId = itemId;
			}
		};

		// Used by components that changes the visible items
		onUpdateItems = (items, breadcrumbItems, request = this.state.request) => {
			if (this.isComponentMounted) {
				this.setState({
					breadcrumbItems: breadcrumbItems,
					items: items,
					request: request
				});
			}
		};

		// Used by any component that initiates a request
		onUpdateRequest = request => {
			if (this.isComponentMounted) {
				this.setState({
					request: request
				});
			}
		};

		// Used to update the viewMode
		onUpdateViewMode = viewMode => {
			if (this.isComponentMounted) {
				this.setState({
					viewMode: viewMode
				});
			}
		};

		render() {
			const props = {
				...this.props,
				// TODO: make this explicit (only 5 state properties anyway)
				...this.state,
				// Is this needed? What for?
				initialSelectedItemId: this.initialSelectedItemId,
				isItemErrored: this.isItemErrored,
				onItemSelect: this.onItemSelect,
				// TODO: rename to onInitialSelectedItemIdChange
				onUpdateInitialSelectedItemId: this.onUpdateInitialSelectedItemId,
				// TODO: rename to onItemsChange
				onUpdateItems: this.onUpdateItems,
				// TODO: rename to onRequestStateChange
				onUpdateRequest: this.onUpdateRequest,
				// TODO: rename to onViewModeChange
				onUpdateViewMode: this.onUpdateViewMode,
				loadItem: loader.load
			};

			return <WrappedComponent {...props} />;
		}

		// TODO: shouldn't this be componentDidMount() ?
		componentWillMount() {
			this.isComponentMounted = true;
		}

		componentWillUnmount() {
			this.isComponentMounted = false;
		}
	};
}
