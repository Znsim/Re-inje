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

// Swagger 문서 설정 (/api-docs 경로에서 열림)
app.use("/api-docs", (req, res, next) => {
  res.status(200);  // Cloudtype health check 대응
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSepc));

// 기본 루트 응답 (선택사항: "/"로 접속 시 메시지 출력)
app.get("/", (req, res) => {
  res.send("Re-Inje 서버가 실행 중입니다.");
});

const inje_iu = require("./routes/Inje_IU/inje_iu");
app.use("/api/inje_iu",inje_iu);

//수동 조회
const inje_iu_refresh = require("./routes/Inje_IU/refresh");
app.use("/api/inje_iu",inje_iu_refresh)

// 매일 오전 9시에 크롤링 실행 (초 분 시 일 월 요일)
cron.schedule("0 0 9 * * *", () => {
  console.log("🕘 [CRON] 오전 9시: 크롤링 시작");

  exec("python ./Crawling/Inje_IU/IU.py", (error, stdout, stderr) => {
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