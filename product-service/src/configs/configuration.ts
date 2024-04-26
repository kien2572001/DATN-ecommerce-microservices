export default () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  relational_db: {
    host: process.env.RELATIONAL_DB_HOST,
    port: parseInt(process.env.RELATIONAL_DB_PORT, 10) || 5432,
    username: process.env.RELATIONAL_DB_USERNAME,
    password: process.env.RELATIONAL_DB_PASSWORD,
    database: process.env.RELATIONAL_DB_DATABASE,
  },
  no_sql_db_uri: process.env.NO_SQL_DB_URI,
});