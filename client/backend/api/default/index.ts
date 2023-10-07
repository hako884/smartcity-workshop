export const handler = async () => {
  const responseBody = { message: "Default Page." };
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(responseBody),
  };
  return response;
}