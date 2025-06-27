const express = require('express');
const router = express.Router()
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSepc = require("./swagger/swagger");
const cron = require("node-cron");
const { exec } = require("child_process");


const app = express();
const port = 3000;
app.use(cors());

app.use("/api-docs", swaggerUi.serve,swaggerUi.setup(swaggerSepc));


const inje_iu = require("./routes/Inje_IU/inje_iu");
app.use("/api/inje_iu",inje_iu);

//수동 조회
const inje_iu_refresh = require("./routes/Inje_IU/refresh");
app.use("/api/inje_iu",inje_iu_refresh)

// 매일 오전 9시에 크롤링 실행 (초 분 시 일 월 요일)
cron.schedule("0 0 9 * * *", () => {
  console.log("🕘 [CRON] 오전 9시: 크롤링 시작");

  exec("python ../Crawling/Inje_IU/IU.py", (error, stdout, stderr) => {
    if (error) {
      console.error("크롤링 중 오류:", error);
      return;
    }
    console.log("크롤링 완료\n", stdout);
  });
});

app.listen(port, ()=>{
    console.log("서버 Start");
    console.log(`http://localhost:${port}/api-docs`);
})