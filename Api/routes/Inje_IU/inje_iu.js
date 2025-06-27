/**
 * @swagger
 * /api/inje_iu:
 *   get:
 *     summary: 마감 임박 프로그램 10개 조회
 *     tags: [inje_iu]
 *     responses:
 *       200:
 *         description: 프로그램 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */


const express = require('express');
const cors = require("cors");
const pool = require("../../db")

const router = express.Router();

router.get("/",async(req,res)=>{
    try{
        const result = await pool.query(
           `SELECT * FROM inje_iu ORDER BY end_date ASC LIMIT 10`
        );
        res.json(result.rows);
    }
    catch(err){
        console.error("프로그램 불러오기 실패 : ", err);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;