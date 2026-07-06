import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose/dist/interfaces/mongoose-options.interface';

export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleFactoryOptions => {
  return {
    uri: getMongoString(configService),
    ...getMongoOptions(),
  };
};

const getMongoString = (configService: ConfigService) => {
  const LOGIN = configService.get('MONGO_LOGIN') as string;
  const PASSWORD = configService.get('MONGO_PASSWORD') as string;
  const DB = configService.get('MONGO_AUTH_DB') as string;
  const HOST = configService.get('MONGO_HOST') as string;
  const PORT = configService.get('MONGO_PORT') as string;

  return `mongodb://${LOGIN}:${PASSWORD}@${HOST}:${PORT}/${DB}`;
};

const getMongoOptions = () => {
  return {};
};
