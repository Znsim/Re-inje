const express = require('express');
const router = express.Router()
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSepc = require("./swagger/swagger");

const app = express();
const port = 3000;
app.use(cors());

app.use("/api-docs", swaggerUi.serve,swaggerUi.setup(swaggerSepc));


const inje_iu = require("./routes/Inje_IU/inje_iu");
app.use("/api/inje_iu",inje_iu);


app.listen(port, ()=>{
    console.log("서버 Start");
    console.log(`http://localhost:${port}/api-docs`);
})