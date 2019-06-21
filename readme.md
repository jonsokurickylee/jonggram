## Introduction

### #0.1 Requirements

1. node
2. git

<hr/>

## Set Up

### #1.0 Setting up the project

- make a git repository and yarn init

  ```bash
  $ git clone https://github.com/jonsoku/jonggram.git
  $ cd jonggram
  $ mkdir src
  $ touch README.md src/server.js nodemon.js .babelrc
  $ yarn init 
  	all enter
  $ yarn add graphql-yoga
  $ yarn add nodemon -D 
  $ yarn add @babel/{node,preset-env,core}
  $ code .
  ```

- package.json

  ```json
  {
    "name": "jonggram",
    "version": "1.0.0",
    "main": "index.js",
    "repository": "https://github.com/jonsoku/jonggram.git",
    "author": "jonsoku <the2792@gmail.com>",
    "license": "MIT",
    "dependencies": {
      "@babel/core": "^7.4.5",
      "@babel/node": "^7.4.5",
      "@babel/preset-env": "^7.4.5",
      "dotenv": "^8.0.0",
      "graphql-yoga": "^1.18.0"
    },
    "devDependencies": {
      "nodemon": "^1.19.1"
    },
    "scripts": {
      "dev": "nodemon --exec babel-node src/server.js"
    }
  }
  ```

- nodemon.json

  ```json
  //ext 추가 : nodemon이 감시해야 할 파일의 확장자들을 지정할 수 있다.
  {
    "ext": "js graphql"
  }
  ```

- .babelrc

  ```babel
  {
    "presets": ["@babel/preset-env"]
  }
  ```

- src/server.js

  ```javascript
  //console창 확인
  console.log("hello")
  ```

### #1.1 Creating GraphQL Server

- prisma를 시작하기 전

  ```bash
  $ yarn add dotenv
  $ touch src/.env
  ```

- src/.env

  ```env
  PORT=4000
  ```

- src/server.js

  ```javascript
  require('dotenv').config();
  import { GraphQLServer } from 'graphql-yoga';
  
  const PORT = process.env.PORT || 4000;
  
  const typeDefs = `
      type Query{
          hello: String!
      }
  `;
  
  const resolvers = {
    Query: {
      hello: () => 'Hi'
    }
  };
  
  const server = new GraphQLServer({ typeDefs, resolvers });
  
  server.start({ port: PORT }, () =>
    console.log(`Server running on port ${PORT}`)
  );
  ```

- Running Server

  ```bash
  $ yarn dev
  ```

- Port 중복 에러날때 (terminal)

  ```bash
  $ lsof -i :4000 
  $ kill -9 PID
  ```

- 최종 브라우저 결과 확인

  ![image-20190622063659088](/Users/jongseoklee/Library/Application Support/typora-user-images/image-20190622063659088.png)

-  [graphql]('http://localhost:4000') 에서 아래와 같은 코드로 결과값 확인

  ```json
  {
    hello
  }
  =====실행=====
  {
    "data": {
      "hello": "Hi"
    }
  }
  ```

### #1.2 Setting Up the Server like the Pros

- middleware : install morgan  

  ```bash
  //morgan is logger(로깅전용모듈)
  $ yarn add morgan
  ```

- make a new folder [src/api]  and new file [src/schema.js]

  ```bash
  $ mkdir src/api
  $ touch src/schema.js
  ```

- yarn add

  ```bash
  $ yarn add graphql-tools merge-graphql-schemas
  ```

- src/api/Greetings/sayHello/sayHello.js, src/api/Greetings/sayHello/sayHello.graphql

  ```bash
  $ cd src/api
  $ mkdir -p Greetings/sayHello
  $ cd Greetings/sayHello
  $ touch sayHello.js sayHello.graphql
  $ cd ~/nomard/jonggram 
  	(comeback to root folder!)
  ```

- src/api/Greetings/sayHello/sayHello.graphql

  ```graphql
  type Query {
    sayHello: String!
  }
  ```

- src/api/Greetings/sayHello/sayHello.js

  ```javascript
  export default {
    Query: {
      sayHello: () => 'Hello'
    }
  };
  ```

- src/schema.js

  ```javascript
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
  ```

- src/server.js

  ```javascript
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
  ```

- sayGoodbye 도 만들어보자

  ```bash
  $ cd src/api/Greetings
  $ mkdir sayGoodbye
  $ touch sayGoodbye/{sayGoodbye.graphql,sayGoodbye.js}
  ```

- src/api/Greetings/sayHello/sayHello.graphql

  ```graphql
  type Query {
    sayGoodbye: String!
  }
  ```

- src/api/Greetings/sayHello/sayHello.js

  ```javascript
  export default {
    Query: {
      sayGoodbye: () => 'Goodbye'
    }
  };
  ```

- result

  ![image-20190622071740529](/Users/jongseoklee/Library/Application Support/typora-user-images/image-20190622071740529.png)

- graphql resolver를 만드는 방법이었다! 

<hr/>

