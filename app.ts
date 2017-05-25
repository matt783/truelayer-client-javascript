import * as express from "express";
import * as parser from "body-parser";
import * as trueLayer from "./index";
import IOptions from "./src/IOptions";

// Get environment varibles
const client_id: string = process.env.client_id;
const client_secret: string = process.env.client_secret;
const redirect_uri: string = process.env.redirect_uri;
// const nonce: string = process.env.nonce;
// const state: string = process.env.state;
// const scope: string = process.env.scope;

// Build 'options' to pass to APIClient
const options: IOptions = {
    client_id,
    client_secret,
    redirect_uri
};

const client = new trueLayer.V1.ApiClient(options);
const clientAuth = client.auth;
const clientData = client.data;

const app = express();

// Redirect to the auth server
app.get("/", (req, res) => {
  const authURL = clientAuth.getAuthUrl();
  res.redirect(authURL);
});

// Body parser setup
app.use(parser.urlencoded({
  extended: true
}));

// Receiving post request
app.post("/truelayer-redirect", async (req, res) => {
  const code: string = req.body.code;
  const tokens = await clientAuth.exchangeCodeForToken(code);
  // console.log("access token: " + tokens.access_token);
  // console.log("refresh token: " + tokens.refresh_token);
  // const newTokens = await clientAuth.refreshAccessToken(tokens.refresh_token);
  // console.log("new access token: " + newTokens.access_token);
  // console.log("new refresh token: " + newTokens.refresh_token);
  const info = await clientData.info(tokens.access_token);
  const me = await clientData.me(tokens.access_token);
  const accounts = await clientData.accounts(tokens.access_token);
  const accountsList = accounts.results as any; // todo is this safe typescript?
  const accountInfo = await clientData.accountInfo(tokens.access_token, accountsList[0].account_id);
  const transactions = await clientData.transactions(tokens.access_token, accountsList[0].account_id, "2017-04-20", "2017-04-30");
  const balance = await clientData.balance(tokens.access_token, accountsList[0].account_id);
  console.log("Info " + JSON.stringify(info));
  console.log("Me " + JSON.stringify(me));
  console.log("Accounts " + JSON.stringify(accounts));
  console.log("Account info " + JSON.stringify(accountInfo));
  console.log("transactions " + JSON.stringify(transactions));
  console.log("balance " + JSON.stringify(balance));


  res.set("Content-Type", "text/plain");
  res.send(`You sent: ${JSON.stringify(tokens.access_token)} to Express`);
});

app.listen(5000, () => {
  console.log("Example app listening on port 5000...");
});
