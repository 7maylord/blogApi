const app = require ("./app.js");
const { connectionToMongodb } = require("./models/dbconnection.js");
const dotenv = require("dotenv");

dotenv.config();
connectionToMongodb();

const PORT = process.env.PORT;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });