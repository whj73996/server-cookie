var http = require("http");
var fs = require("fs");
var url = require("url");
const { join } = require("path");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/

  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery);

  if (path === "/home.html") {
    const cookie = request.headers['cookie']
    console.log(cookie);
    if (cookie === 'logined=1') {
      const homeHtml= fs.readFileSync('./public/home.html').toString()
      const string = homeHtml.replace("{{user.name}}", "已登录");
      response.write(string);
    } else {
      const homeHtml = fs.readFileSync("./public/home.html").toString();
      const string = homeHtml.replace("{{user.name}}", "未登录");
    response.write(string);

    }
  } else if (path === "/sign_in" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const userArray = JSON.parse(fs.readFileSync("./db/users.json").toString());
    const array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(array).toString();
      const obj = JSON.parse(string);
      console.log(obj);
      console.log(userArray);
      const user = userArray.find(
        (user) => user.name === obj.name && user.password === obj.password
      );
      console.log(user);
      if (user === undefined) {
        response.statusCode = 400;
        response.setHeader("Content-Type", "text/json;charset=utf-8");
        response.write(`{"errorCode":4001}`);
      } else {
        response.statusCode = 200;
        response.setHeader("Set-Cookie",`user_id=1`);
      }
    });
  } else if (path === "/register" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const userArray = JSON.parse(fs.readFileSync("./db/users.json").toString());
    const array = [];
    request.on("data", (chunk) => {
      array.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(array).toString();
      const obj = JSON.parse(string);
      const lastUser = userArray[userArray.length - 1];
      const newUser = {
        id: lastUser ? lastUser.id + 1 : 1,
        name: obj.name,
        password: obj.password,
      };
      userArray.push(newUser);
      fs.writeFileSync("./db/users.json", JSON.stringify(userArray));
    });
  } else {
    response.statusCode = 200;

    const filePath = path === "/" ? "/index.html" : path;
    const index = filePath.lastIndexOf(".");
    const suffix = filePath.substring(index);
    const fileTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
    };

    response.setHeader(
      "Content-Type",
      `${fileTypes[suffix] || "text/html"};charset=utf-8`
    );

    let content;

    try {
      content = fs.readFileSync(`./public/${filePath}`);
    } catch (error) {
      content = "文件内容不存在";
      response.statusCode = 404;
    }
    response.write(content);
  }
  response.end()  //不end服务器会一直请求

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);
