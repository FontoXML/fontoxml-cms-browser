import * as React from 'react';

import type { ModalProps } from 'fontoxml-fx/src/types';
import operationsManager from 'fontoxml-operations/src/operationsManager';

type SubmitModalData = { [key: string]: unknown };

type Props = ModalProps<{ insertOperationName: string }, SubmitModalData>;

export default function withInsertOperationNameCapabilities(
	getSubmitModalData: (selectedItem: $TSFixMeAny) => SubmitModalData,
	canSubmitSelectedItem: (selectedItem: $TSFixMeAny) => boolean
) {
	return function wrapWithInsertOperationNameCapabilities(
		WrappedComponent: React.ComponentType
	): React.ComponentType {
		return class InsertOperationNameCapabilities extends React.Component<Props> {
			private isMountedInDOM = true;

			public override state = {
				isSubmitButtonDisabled: true,
			};

			// Use this to check if the selectedItem can be submitted based on the insertOperationName.
			// When this is true, it will be submitted, else nothing happens.
			private readonly determineAndHandleItemSubmitForSelectedItem = (
				selectedItem
			) => {
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
						.then((operationState) => {
							if (this.isMountedInDOM && operationState.enabled) {
								submitModal(submitModalData);
							}
						})
						.catch((_error) => undefined);
				} else if (this.isMountedInDOM) {
					submitModal(submitModalData);
				}
			};

			// Use this to determine if the submit button should be disabled based on the
			// insertOperationName.
			private readonly determineAndHandleSubmitButtonDisabledState = (
				selectedItem
			) => {
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
							this.props.data.insertOperationName!,
							initialData
						)
						.then((operationState) => {
							if (this.isMountedInDOM) {
								this.setState({
									isSubmitButtonDisabled:
										!operationState.enabled,
								});
							}
						})
						.catch((_) => {
							if (this.isMountedInDOM) {
								this.setState({ isSubmitButtonDisabled: true });
							}
						});
				}
			};

			public override render() {
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

			public override componentWillUnmount() {
				this.isMountedInDOM = false;
			}
		};
	};
}
