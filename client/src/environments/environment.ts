// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  apiUrl: window.location.href.replace(/5000\/.*$/, "3000"),
  // Google OAuth Client ID - replace with your actual Google Client ID from Google Cloud Console
  // Steps: https://console.cloud.google.com > APIs & Services > Credentials > Create OAuth 2.0 Client
  googleClientId: '472486032122-0k17ga020k4njtsfgjhfdl239gbtp6k5.apps.googleusercontent.com'
};
