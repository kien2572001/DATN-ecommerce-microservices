// import {registerAs} from "@nestjs/config";
//
// export default registerAs('app', () => ({
//   name: process.env.APP_NAME || 'user-service',
//   env: process.env.NODE_ENV || 'development',
//   port: parseInt(process.env.PORT, 10) || 3000,
//   mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/nest',
// }));

export default () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/nest',
});