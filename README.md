# TrueLayer
TrueLayer allows financial applications to connect securely with their customer’s bank data. TrueLayer provides a unified interface between multiple financial institutions and third party applications over a common RESTful API. 
For more information and for obtaining a new TrueLayer developer account, visit https://truelayer.com. 

# TrueLayer client library - Javascript 

This is the official Typescript client library that helps with the creation of applications that use TrueLayer APIs. 
Typescript is a typed superset of Javascript that compiles to plain JavaScript. More information regarding Typescript can be found at: https://www.typescriptlang.org/

The truelayer-client-javascript library can be used from either JavaScript (Node.js) or TypeScript. 

## Installation

```bash
npm install truelayer-client
```

## Example usage
* This is a simple Javascript example on how to create an Express app that uses the client library. [Express](https://expressjs.com/) is a web application framework for Node.js designed for building web applications. 
    
    ```javascript
    const Express = require("express");
    const {AuthAPIClient, DataAPIClient} = require("truelayer-client");
    
    // Create Express instance
    const app = Express();
    
    // Create TrueLayer client instance
    const client = new AuthAPIClient({
        client_id: "<client_id>",
        client_secret: "<client_secret>"
    });
    
    const redirect_uri = "http://localhost:5000/truelayer-redirect";
    
    // Redirect to the authentication server
    app.get("/", (req, res) => {
        // read JSDocs for descriptions for all parameters
        const authURL = client.getAuthUrl(redirect_uri, ["info"], "nonce", "");
        res.redirect(authURL);
    });
    
    // Receiving POST request
    app.post("/truelayer-redirect", async (req, res) => {
        // Exchange an authentication code for an access token
        const code = req.body.code;
        const tokens = await client.exchangeCodeForToken(redirect_uri, code);
        
        // Call to any of the Data endpoints using the access token obtained. Eg. call to /info endpoint
        const info = await DataAPIClient.getInfo(tokens.access_token);
        console.log("Info: " + JSON.stringify(info));
        
        res.set("Content-Type", "text/plain");
        res.send(`Access Token: ${JSON.stringify(tokens.access_token)}`);
    });
    
    ```


* Two sample applications have been created and are available to run from the `./examples` folder.
In order to run the examples, `CLIENT_ID` and `CLIENT_SECRET` need to be set as environment variables. These can be obtained by signing up on https://truelayer.com.
Set the environment variables from the console:
    ```bash
    export CLIENT_ID="<client>"
    export CLIENT_SECRET="<secret>"
    ```

### Express example
This example simply prints to console output from all the methods provided on top of the Authentication APIs and Data APIs. Run it from the command line:

```bash
node examples/express/app.js
```

Once the app is listening, navigate to `http://localhost:5000` and introduce credentials.

### Koa-marko example
This is a [koa-marko](https://github.com/ratson/koa-marko) example that authenticates a user and displays information regarding the available accounts, balance and transactions. 

In order to run this example, just run from the command line:
```bash
node examples/koa-marko/server.js
```

### Authentication and tokens
*Note: The code snippets below are extracted from the above Express example.*
* The first step in authentication is to redirect the application to the TrueLayer Authentication Server. 

    ```javascript
        const authURL = client.getAuthUrl(env.REDIRECT_URI, scope, "nonce", state = "", true);
        res.redirect(authURL);
    ```
* Upon successful redirect, a one-time code is generated when the HTTP POST is performed to the redirect_uri provided by the client.

    ```javascript
    app.post("/truelayer-redirect", async (req, res) => {
        const code = req.body.code;
        ...
        })
    ```
* After the code is obtained, this can be exchanged for an access token.
    ```javascript
    const tokens = await client.exchangeCodeForToken(env.REDIRECT_URI, code);
    ``` 
* The authorization server will respond with:
    * *access token* - short-lived JWT token (default 1h) used to access data on behalf of the customer
    * *refresh token* - long-lived code used to obtain a new access token

* Use `isValidToken` to check whether an access token is still valid.
* In the case that the `access_token` has expired, ```refreshAccessToken``` can be used for refreshing the token. This will return new values for both the access_token and refresh_token (old refresh_token no longer valid).

## Project structure
This client library comprises of two pieces of functionality represented by separate classes:
1. Authentication - [AuthAPIClient](./src/v1/AuthAPIClient.ts)
* This is responsible for providing methods that allow developers to perform customer authentication and client authorization.
* The following methods are provided in AuthAPIClient:
    * `getAuthUrl` - builds a correctly formatted authentication url used for redirection to the authentication server.
    * `exhangeCodeForToken` - exchanges an authentication code for an access token
    * `refreshAccessToken` - refreshes the access token using the refresh token. Access tokens expire after a set period of time (default 1h). 
    * `isTokenExpired` - checks whether the current access token is still valid.

2. Data APIs - [DataAPIClient](./src/v1/DataAPIClient.ts)
* Once the authentication is successful, methods are provided for calling the various API endpoints for obtaining information regarding the authenticated bank account such as : accounts, balance, transactions etc.
* The following methods are provided in DataAPIClient:
    * `getMe` - call to the */me* endpoint
    * `getInfo` - call to the */info* endpoint
    * `getAccounts` - call to the */accounts* endpoint
    * `getAccount` - call to the */accounts/{account_id}* endpoint
    * `getTransactions` - call to the */accounts/{account_id}/transactions* endpoint
    * `getBalance` - call to the */accounts/{account_id}/balance* endpoint

### Errors
The errors are handled using the APIError class. The errors returned will have the following format:
```json
{
    "name": "error_name",
    "message": "error_message"
}
```


## Tests
The client library has both integration and unit tests.
In order to run the integration tests, an access token needs to be provided. If this is not provided, only the unit tests will be run.

```bash
export access_token=<access_token>
npm run test
```
## Contributions
In order to contribute to the existing code base, please follow these steps: 
* Fork the repo
* Create a new branch (```git checkout -b <improvements-branch>```)
* Make the appropriate changes
* Write tests for the modified code
* Commit changes (```git commit -m "<message>"```)
* Push to the branch (```git push origin <improvements-branch>```)
* Create a pull request
