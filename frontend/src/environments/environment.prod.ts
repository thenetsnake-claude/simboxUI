export const environment = {
  production: true,
  apiUrl: '/api',
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
          uri: '/api/*',
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
