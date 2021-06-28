import React, { Component } from 'react';

import operationsManager from 'fontoxml-operations/src/operationsManager';

export default function withInsertOperationNameCapabilities(
	getSubmitModalData,
	canSubmitSelectedItem
) {
	return function wrapWithInsertOperationNameCapabilities(WrappedComponent) {
		return class InsertOperationNameCapabilities extends Component {
			isMountedInDOM = true;

			state = {
				isSubmitButtonDisabled: true,
			};

			// Use this to check if the selectedItem can be submitted based on the insertOperationName.
			// When this is true, it will be submitted, else nothing happens.
			determineAndHandleItemSubmitForSelectedItem = (selectedItem) => {
				const {
					data: { insertOperationName },
					submitModal,
				} = this.props;

				const submitModalData = getSubmitModalData(selectedItem);
				if (insertOperationName) {
					const initialData = {
						...this.props.data,
						...submitModalData,
					};

					operationsManager
						.getOperationState(insertOperationName, initialData)
						.then(
							(operationState) =>
								this.isMountedInDOM &&
								operationState.enabled &&
								submitModal(submitModalData)
						)
						.catch((_error) => {
							return;
						});
				} else if (this.isMountedInDOM) {
					submitModal(submitModalData);
				}
			};

			// Use this to determine if the submit button should be disabled based on the
			// insertOperationName.
			determineAndHandleSubmitButtonDisabledState = (selectedItem) => {
				const { insertOperationName } = this.props.data;

				this.setState({
					isSubmitButtonDisabled:
						(canSubmitSelectedItem(selectedItem) &&
							!!insertOperationName) ||
						!canSubmitSelectedItem(selectedItem),
				});

				if (
					canSubmitSelectedItem(selectedItem) &&
					insertOperationName
				) {
					const initialData = {
						...this.props.data,
						...getSubmitModalData(selectedItem),
					};

					operationsManager
						.getOperationState(
							this.props.data.insertOperationName,
							initialData
						)
						.then(
							(operationState) =>
								this.isMountedInDOM &&
								this.setState({
									isSubmitButtonDisabled:
										!operationState.enabled,
								})
						)
						.catch(
							(_) =>
								this.isMountedInDOM &&
								this.setState({ isSubmitButtonDisabled: true })
						);
				}
			};

			render() {
				const props = {
					...this.props,
					determineAndHandleItemSubmitForSelectedItem:
						this.determineAndHandleItemSubmitForSelectedItem,
					determineAndHandleSubmitButtonDisabledState:
						this.determineAndHandleSubmitButtonDisabledState,
					isSubmitButtonDisabled: this.state.isSubmitButtonDisabled,
				};

				return <WrappedComponent {...props} />;
			}

			componentWillUnmount() {
				this.isMountedInDOM = false;
			}
		};
	};
}
