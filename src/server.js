require('dotenv').config();
import { GraphQLServer } from 'graphql-yoga';
import logger from 'morgan';
import schema from './schema';

const PORT = process.env.PORT || 4000;

//GraphQLServer 에는 express 서버가 내장되어있음.
const server = new GraphQLServer({ schema });

//live update를 위해 schema를 polling하고 있으므로, 계속 로그가 기록된다.
//add middleware
server.express.use(logger('dev'));

server.start({ port: PORT }, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
