const Fetcher = (actionPrefix, paramsFunc) => {

    const requestAction = key => ({
        type: actionPrefix + '_REQUEST',
        key
    })

    const successAction = ({ key, result }) => ({
        type: actionPrefix + '_SUCCESS',
        key,
        result
    })

    const failureAction = ({ key, error }) => ({
        type: actionPrefix + '_FAILURE',
        key,
        error
    })


    return key => {
        return dispatch => {

            const dispatchSuccessAction = result => {
                dispatch(successAction({ key, result }))
            }

            const {
                fetchURLFunc,
                fetchOptionsFunc = key => ({ method: 'GET' }),
                responseType = 'json',
                parseResponse = value => value,
                deferredSuccess = undefined
            } = paramsFunc(dispatchSuccessAction)

            if (typeof actionPrefix !== 'string' ||
                typeof fetchURLFunc !== 'function') {
                console.error(
                    'Fetcher requires string `actionPrefix` ' +
                        ' and function `fetchURLFunc` to be ' +
                        'specified in paramsFunc; got ' +
                        actionPrefix + ' (type ' +
                        (typeof actionPrefix) + ') and (type ' +
                        (typeof fetchURLFunc) + '), respectively'
                )
                return;
            }

	    dispatch(requestAction(key));

	    return fetch(fetchURLFunc(key), fetchOptionsFunc(key)).then(
	        response => response[responseType]().then(
		    value => {
                        if (typeof deferredSuccess !== 'undefined') {
                            deferredSuccess(value);
                            return;
                        }
                        dispatchSuccessAction(parseResponse(value))
                    },
		    error => dispatch(failureAction({ key, error }))
	        ),
	        error => dispatch(failureAction({ key, error }))
	    )
        }
    }
}

export default Fetcher;
