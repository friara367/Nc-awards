
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    },
    body: "NC AWARDS — обычный файл. Netlify использует netlify/functions/results.js"
  };
};
