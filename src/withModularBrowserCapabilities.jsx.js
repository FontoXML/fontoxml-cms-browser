import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default function withModularBrowserCapabilities(
	WrappedComponent,
	getInitialItems,
	initialViewMode = null
) {
	return class ModularBrowser extends Component {
		static propTypes = {
			cancelModal: PropTypes.func.isRequired,
			data: PropTypes.object.isRequired,
			submitModal: PropTypes.func.isRequired
		};
		isComponentMounted = false;
		cachedFileByRemoteId = {};
		cachedErrorByRemoteId = {};

		state = {
			// Contains information on the current/last known request
			// { type: initial|search|browse|upload, ?query, ?error, ?resultCount }
			request: null,

			// Contains the items that the user can choose from
			breadcrumbItems: [],

			// Contains the items that the user can choose from
			items: [],

			// The item that is previewed and would be submitted if the user continues
			selectedItem: null,

			// Contains information for the viewMode, for example list or grid
			viewMode: initialViewMode
		};

		addCachedFileByRemoteId = (id, file) => (this.cachedFileByRemoteId[id] = file);

		addCachedErrorByRemoteId = (id, error) => (this.cachedErrorByRemoteId[id] = error);

		deleteCachedFileByRemoteId = id => delete this.cachedFileByRemoteId[id];

		deleteCachedErrorByRemoteId = id => delete this.cachedErrorByRemoteId[id];

		// Used by any component to change the currently selected item
		onItemSelect = item => {
			if (this.isComponentMounted) {
				this.setState({
					selectedItem: item
				});
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

		// Used by components that changes the visible items
		onUpdateItems = (items, request = this.state.request) => {
			if (this.isComponentMounted) {
				this.setState({
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
				...this.state,
				addCachedErrorByRemoteId: this.addCachedErrorByRemoteId,
				addCachedFileByRemoteId: this.addCachedFileByRemoteId,
				deleteCachedErrorByRemoteId: this.deleteCachedErrorByRemoteId,
				deleteCachedFileByRemoteId: this.deleteCachedFileByRemoteId,
				cachedErrorByRemoteId: this.cachedErrorByRemoteId,
				cachedFileByRemoteId: this.cachedFileByRemoteId,
				onItemSelect: this.onItemSelect,
				onUpdateItems: this.onUpdateItems,
				onUpdateRequest: this.onUpdateRequest,
				onUpdateViewMode: this.onUpdateViewMode
			};

			return <WrappedComponent {...props} />;
		}

		componentDidMount() {
			this.isComponentMounted = true;
			if (typeof getInitialItems !== 'function') {
				return;
			}

			this.onUpdateRequest({
				type: 'initial',
				busy: true
			});

			return Promise.resolve(getInitialItems(this.props.data))
				.then(items => {
					if (!items || !items.length) {
						return this.onUpdateRequest(null);
					}
					this.onUpdateItems(items, null);
				})
				.catch(error => {
					console.error(error);
					this.onUpdateRequest(null);
				});
		}

		componentWillUnmount() {
			this.isComponentMounted = false;
		}
	};
}
