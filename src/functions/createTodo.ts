import { APIGatewayProxyHandler } from "aws-lambda";
import dayjs from "dayjs";
import { document } from "../utils/dynamodbClient";

interface ICreateTodo {
  id: string;
  user_id: string;
  title: string;
  deadline: Date;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id, user_id, title, deadline } = JSON.parse(event.body) as ICreateTodo;

  await document.put({
    TableName: "todos_ignite",
    Item: {
      id,
      user_id, 
      title, 
      done: false, 
      deadline,
      created_at: dayjs(new Date()).format("DD/MM/YYYY")
    }
  }).promise();

  const response = await document.query({
    TableName: "todos_ignite",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Todo criado com sucesso!",
      todo: response.Items[0]
    })
  }
}