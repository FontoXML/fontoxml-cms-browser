import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { SearchInput } from 'fds/components';

export default class ModalBrowserSearchBar extends Component {
	static defaultProps = {
		browseContextDocumentId: null,
		searchParameters: null
	};

	static propTypes = {
		browseContextDocumentId: PropTypes.string,

		// from withModularBrowserCapabilities
		onSearchRequest: PropTypes.func.isRequired,
		refreshItems: PropTypes.func.isRequired,
		request: PropTypes.object.isRequired,
		searchParameters: PropTypes.object
	};

	state = {
		fulltext: ''
	};

	onFulltextChange = fulltext => {
		this.setState({
			fulltext
		});
	};

	requestSearch(query) {
		const { browseContextDocumentId, onSearchRequest } = this.props;

		const searchParameters = {
			resultTypes: ['file'],
			folderId: null,
			query,
			offset: 0
		};

		return onSearchRequest(browseContextDocumentId, searchParameters);
	}

	onSearchSubmit = () => {
		const { browseContextDocumentId, refreshItems } = this.props;
		const { fulltext } = this.state;

		if (!fulltext) {
			// No query, so go back to normal view.
			refreshItems(browseContextDocumentId, { id: null });
			return;
		}

		this.requestSearch({
			fulltext
		});
	};

	componentWillReceiveProps(nextProps) {
		if (nextProps.searchParameters && nextProps.searchParameters.query) {
			// Update search input to current state.
			if (nextProps.searchParameters.query.fulltext !== this.state.fulltext) {
				this.setState({
					fulltext: nextProps.searchParameters.query.fulltext
				});
			}
		} else {
			// Clear search input.
			this.setState({
				fulltext: ''
			});
		}
	}

	render() {
		const { request } = this.props;
		const { fulltext } = this.state;

		return (
			<SearchInput
				isDisabled={!!request && !!request.busy}
				value={fulltext}
				onChange={this.onFulltextChange}
				onSubmitButtonClick={this.onSearchSubmit}
			/>
		);
	}
}
