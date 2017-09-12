class Loader {
	constructor(loadItem) {
		this.cachedItemByRemoteId = {};
		this.loadItem = loadItem;
	}

	load = remoteId => {
		const cachedItem = this.cachedItemByRemoteId[remoteId];
		if (cachedItem) {
			if (cachedItem instanceof Error) {
				// There has been an error while loading the item
				return Promise.reject(cachedItem);
			}
			if (cachedItem instanceof Promise) {
				// The item is in a loading state
				return cachedItem;
			}
			// The item has been loaded succesfully
			return Promise.resolve(cachedItem);
		}

		const promise = this.loadItem(remoteId);
		this.cachedItemByRemoteId[remoteId] = promise;

		promise.then(
			item => {
				this.cachedItemByRemoteId[remoteId] = item;
				return item;
			},
			error => {
				this.cachedItemByRemoteId[remoteId] = error;
				return error;
			}
		);

		return promise;
	};

	isItemErrored = remoteId => {
		return this.cachedItemByRemoteId[remoteId] instanceof Error;
	};
}

export default Loader;
