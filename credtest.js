const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL ?? '',
    private_key: process.env.CLIENT_EMAIL ?? ''
  },
  projectId: process.env.PROJECT_ID ?? '',
  scopes: SCOPES
});

module.exports = auth;
// this works for authentication too, could be useful when deploying to cloud with only ENV variables like vercel