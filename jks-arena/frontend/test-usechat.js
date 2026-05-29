const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { useChat } = require("@ai-sdk/react");

function Test() {
  const chat = useChat();
  console.log("KEYS:", Object.keys(chat));
  return React.createElement("div");
}

renderToStaticMarkup(React.createElement(Test));
