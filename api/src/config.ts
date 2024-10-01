export const config = () => ({
  url: process.env.COUCHBASE_URL,
  username: process.env.COUCHBASE_USERNAME,
  password: process.env.COUCHBASE_PASSWORD,
  frontendUrl: process.env.FRONTEND_URL,
});
