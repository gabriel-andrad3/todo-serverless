import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'todos-serverless',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    'serverless-dynamodb-local'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:*"],
        Resource: ["*"]
      }
    ]
  },
  // import the function via paths
  functions: { 
    createTodo: {
      handler: "src/functions/createTodo.handler",
      events: [
        {
          http: {
            path: "todos",
            method: "post",

            cors: true
          }
        }
      ]
    },
    getTodo: {
      handler: "src/functions/getTodo.handler",
      events: [
        {
          http: {
            path: "todos/{user_id}",
            method: "get",

            cors: true
          }
        }
      ]
    }
   },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true
      }
    }
  },
  resources: {
    Resources: {
      todosTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "todos_ignite",
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            },
            {
              AttributeName: "user_id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            }            
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "UserIdIndex",
              KeySchema: [
                {
                  AttributeName: "user_id",
                  KeyType: "HASH",
                }
              ],
              Projection: {
                ProjectionType: "ALL"
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
              },
            }
          ]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
