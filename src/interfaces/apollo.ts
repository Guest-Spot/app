export interface ApolloServerError {
  extensions: {
    code: string;
    error: {
      details: unknown;
      message: string;
      name: string;
    };
  };
  message: string;
}
