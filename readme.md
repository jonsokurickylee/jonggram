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

- [graphql]('http://localhost:4000') 에서 아래와 같은 코드로 결과값 확인

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

## Setting Up Prisma

### #2.0 Introduction to Prisma

- what is the Prisma ?

  - prisma is **ORM** : Object-relational mapping(객체 관계 연결)

  - why do we need the **Prisma** ? 

    - Prisma는 **DB** 관련 된 어려운 문제들을 해결해준다. 

    - [Prisma H.P]('https://www.prisma.io/') join and Deploy a new Prisma service's Log into Prisma CLI

      ```bash
      $ npm install -g prisma
      or
      $ brew tap prisma/prisma
      $ brew install prisma
      $ prisma login -k eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjang2bzE3ODlya2JuMDg2MWZiamZpd2dnIiwiaWF0IjoxNTYxMTU2MTAwLCJleHAiOjE1NjM3NDgxMDB9.uac-4PQkQF5K1oY9ASfWgQxfhqjqV402C-cLCVx0Xr0
      $ prisma init
      	select Demo sever  MySQL database
      	select leejongseok-b34ece/demo-us1 Hosted......
      	service jonggram (enter)
      	stage dev (enter)
      	select Prisma JavaScript Client
      $ prisma deploy
      	generated폴더가 자동으로 생성될 것임
      ```

    - .gitignore

      ```git
      generated //추가
      ```

    - datamodel.prisma

      ```prisma
      // User : table명 (model name)
      // id, name, lastName : column명 
      type User {
        id: ID! @id
        name: String!
        lastName: String!
      }
      ```

### #2.1 Datamodel with Prisma

- make a model on Prisma

  - datamodel.prisma

    ```prisma
    type User {
      id: ID! @id
      username: String! @unique
      email: String! @unique
      firstName: String @default(value: "")
      lastName: String
      bio: String
      following: [User!]! @relation(name: "FollowRelation")
      followers: [User!]! @relation(name: "FollowRelation")
      posts: [Post!]!
      likes: [Like!]!
      comments: [Comment!]!
      rooms : [Room!]!
    }
    
    type Post {
      id: ID! @id
      location: String
      caption: String!
      user: User!
      files: [File!]!
      likes: [Like!]!
      comments: [Comment!]!
    }
    
    type Like {
      id: ID! @id
      user: User!
      post: Post!
    }
    
    type Comment {
      id: ID! @id
      text: String!
      user: User!
      post: Post!
    }
    
    type File {
      id: ID! @id
      url: String!
      post: Post!
    }
    
    type Room {
      id: ID! @id
      participants : [User!]!
      messages: [Message!]!
    }
    
    type Message {
      id : ID! @id
      text: String!
      from : User! @relation(name: "From")
      to: User! @relation(name: "To")
      room: Room!
    }
    ```

  ### #2.2 Testing Prisma OMG

  - [query작성 playground]("https://us1.prisma.sh/leejongseok-b34ece/jonggram/dev")

    - createUser

      ```prisma
      mutation {
        createUser(data:{username:"jonsoku", email:"admin@gmail.com"}){
          id
        }
      }
      ```

    - user

      ```prisma
      {
        user(where:{id:"cjx70okh6a1u40b421zp9s2yg"}){
          username
        }
      }
      ```

    - updateUser

      ```prisma
      mutation {
        updateUser(data:{firstName:"aida", lastName:"kazuko"}where:{id:"cjx70okh6a1u40b421zp9s2yg"}){
          username
        }
      }
      ```

    - updateUser

      ```prisma
      mutation {
        updateUser(
          data:{following:{connect:{id:"cjx70okh6a1u40b421zp9s2yg"}}}
          where:{id:"cjx7100tba2uj0b420nqyjdnx"}
        ){
          username
          firstName
          lastName
          following{
            id
          }
          followers{
            id
          }
        }
      }
      ```

    - showUser

      ```prisma
      {
        user(where:{id:"cjx70okh6a1u40b421zp9s2yg"}){
          username
          followers{
            username
            email
          }
          following{
            username
            email
          }
          lastName
          firstName
        }
      }
      ```

  ### #2.3 Integrating Prisma in our Server

  - 실제 api에서 Prisma를 사용하자

  - package.json

    ```json
    "scripts": {
        "dev": "nodemon --exec babel-node src/server.js",
        "deploy": "prisma deploy",
        "generate": "prisma generate",
        "prisma": "yarn run deploy && yarn run generate"
      }
    ```

  - yarn prisma

    ```bash
    $ yarn prisma
    ```

  - yarn add

    ```bash
    $ yarn add prisma-client-lib
    ```

  - src/api/Greetings/sayHello/sayHello.js

    ```javascript
    import { prisma } from '../../../../generated/prisma-client';
    
    export default {
      Query: {
        sayHello: async () => {
          console.log(await prisma.users());
          return 'HELLO';
        }
      }
    };
    ```

  - prisma가 자동으로 client를 만들어주고, 이 client는 사용자 정보를 체크할 수 있다.

  

  

