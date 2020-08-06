const fs = require('fs')
const users = fs.readFileSync("./db/users.json").toString()
const array = JSON.parse(users)

const users2 = { id: 2, name: "frank2", password: "xxx" };
array.push(users2)

const string = JSON.stringify(array)
fs.writeFileSync('./db/users.json',string)