import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamodbClient";

// interface ITodo {
//   id: string;
//   user_id: string;
//   title: string;
//   deadline: Date;
//   done: boolean;
//   created_at: Date;
// }

export const handler: APIGatewayProxyHandler = async (event) => {
  const { user_id } = event.pathParameters;

  const response = await document.query({
    TableName: "todos_ignite",
    IndexName: "UserIdIndex",
    KeyConditionExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
      ":user_id": user_id
    }
  }).promise();
  
  const todos = response.Items;

  if (todos != []) {
    return {
      statusCode: 200,
      body: JSON.stringify(todos)
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "user_id inválido!"
    })
  };
}