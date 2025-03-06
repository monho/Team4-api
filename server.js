const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // 환경 변수 관리

const app = express();
const PORT = 5000;

// 📌 MySQL 연결 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "bsksbamboo",
    charset: "utf8mb4" // ✅ 한글 깨짐 방지
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL 연결 오류:", err);
        return;
    }
    console.log("✅ MySQL 연결 성공!");
});

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// 📌 1️⃣ 팀원 조회 (GET /members)
app.get("/members", (req, res) => {
    const sql = "SELECT * FROM MEMBER";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "데이터를 불러올 수 없습니다." });
        res.json(results);
    });
});

// 📌 2️⃣ 팀원 등록 (POST /members)
app.post("/members", (req, res) => {
    const { name, rank, mbti, style, objective, hobby } = req.body;
    if (!name || !rank) return res.status(400).json({ error: "이름과 역할은 필수 입력값입니다." });

    const sql = `
        INSERT INTO MEMBER (MEMBER_NAME, MEMBER_RANK, MEMBER_MBTI, MEMBER_STYLE, MEMBER_OBJECTIVE, MEMBER_HOBBY) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [name, rank, mbti, style, objective, hobby];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: "데이터를 저장할 수 없습니다." });

        res.status(201).json({ id: result.insertId, name, rank, mbti, style, objective, hobby });
    });
});

// 📌 3️⃣ 팀원 삭제 (DELETE /members/:name)
app.delete("/members/:name", (req, res) => {
    const memberName = req.params.name;
    const sql = "DELETE FROM MEMBER WHERE MEMBER_NAME = ?";

    db.query(sql, [memberName], (err, result) => {
        if (err) return res.status(500).json({ error: "데이터를 삭제할 수 없습니다." });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "해당 팀원을 찾을 수 없습니다." });
        }

        res.json({ message: "삭제 완료", name: memberName });
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
