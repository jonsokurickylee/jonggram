/*
 *  모든 파일들을 이 파일에서 합친다.
 *  api폴더 안에 아주 많은 graphql 파일들이 추가될 것
 *  같은 위치에 resolvers 파일들이 추가 될 것이다.
 *  이와같은 방식으로, server.js에는 schema.js 파일 하나만 입력하면 된다.
 *  정리 : 폴더를 만들고, 폴더 밑에 graphql 파일들과 resolver 파일들을 만든다.
 *  그리고 그것들을 모아서 한번에 import한다.
 */
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import path from 'path';

/*
 *  fileLoader 함수의 인자로 파일의 경로를 입력해야한다.
 *  import path from "path"; 추가한다.
 *  api 폴더 밑에는 resolver가 아닌 js 파일을 두면 안된다.
 *  만약 resolver가 아닌 js파일을 둔다면 반드시 문제가 생긴다. (규칙)
 */

const allTypes = fileLoader(path.join(__dirname, '/api/**/*.graphql'));
const allResolvers = fileLoader(path.join(__dirname, '/api/**/*.js'));

const schema = makeExecutableSchema({
  typeDefs: mergeTypes(allTypes),
  resolvers: mergeResolvers(allResolvers)
});

export default schema;
