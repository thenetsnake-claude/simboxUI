export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  auth0: {
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
    authorizationParams: {
      audience: 'https://your-api-audience',
      redirect_uri: window.location.origin
    },
    httpInterceptor: {
      allowedList: [
        {
          uri: 'http://localhost:3000/api/*',
          tokenOptions: {
            authorizationParams: {
              audience: 'https://your-api-audience'
            }
          }
        }
      ]
    }
  }
};
