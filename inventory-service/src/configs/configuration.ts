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
  aws_s3: {
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_S3_PUBLIC_BUCKET,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6378,
  },
  user_service_url: process.env.USER_SERVICE_URL,
  product_service_url: process.env.PRODUCT_SERVICE_URL,
  inventory_service_url: process.env.INVENTORY_SERVICE_URL,
  order_service_url: process.env.ORDER_SERVICE_URL,

  broker: process.env.KAFKA_BROKER || 'localhost:9092',
  services: {
    inventory: {
      clientId: 'inventory',
      groupId: 'inventory',
      name: 'inventory-kafka-client',
    },
  },
  inventory_grpc_url: process.env.INVENTORY_GRPC_URL,
});
