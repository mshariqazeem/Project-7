/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          // Reject with an Error object if the response status is not OK
          return reject(new Error(JSON.stringify({ status: response.status, statusText: response.statusText })));
        }
        // Parse the response as JSON and resolve the promise with the data
        return response.json()
          .then((data) => resolve({ data }))
          .catch(() => reject(new Error(JSON.stringify({ status: 500, statusText: "Failed to parse JSON" }))));
      })
      .catch((error) => reject(new Error(JSON.stringify({ status: 500, statusText: error.message || "Network Error" }))));
  });
}

export default fetchModel;