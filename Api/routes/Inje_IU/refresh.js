/**
 * @swagger
 * /api/inje_iu/refresh:
 *   get:
 *     summary: 수동으로 크롤링 실행
 *     tags: [inje_iu]
 *     responses:
 *       200:
 *         description: 수동 크롤링 성공
 *       500:
 *         description: 크롤링 실패
 */

const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

router.get("/refresh", (req, res) => {
  console.log("🧹 [MANUAL] 수동 크롤링 실행 요청");

  exec("python ../Crawling/Inje_IU/IU.py", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ 수동 크롤링 오류:", error);
      return res.status(500).json({ message: "크롤링 실패", error: error.message });
    }

    console.log("✅ 수동 크롤링 완료\n", stdout);
    res.json({ message: "크롤링 완료", output: stdout });
  });
});

module.exports = router;
