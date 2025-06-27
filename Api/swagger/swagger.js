// swagger.js
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Re-Inje API Docs",
      version: "1.0.0",
      description: "Inje 대학교 프로그램 크롤링 API 문서",
    },
    servers: [
      //PC
      // {
      //   url: "http://localhost:3000", // 서버 주소
      // },
      {
        url : "https://port-0-re-inje-m7syarm12c5a1376.sel4.cloudtype.app", //배포 주소
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/**/*.js")], // API가 정의된 파일 경로
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
