const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const db = require("./app/models");
require('./app/db/associations');
db.sequelize.sync();

var corsOptions = {
  origin: "http://localhost:3000"
};


app.use(cors(corsOptions));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get("/", (req, res) => {
  res.json({ message: "OK - seconline" });
});

require("./app/routes/index.routes")(app);

const PORT = process.env.PORT || 15000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});