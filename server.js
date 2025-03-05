const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;
const DATA_FILE = "./data/team.json";

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// 📌 1. 팀원 조회 (GET /members)
app.get("/members", (req, res) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "파일을 읽을 수 없습니다." });
        res.json(JSON.parse(data));
    });
});

// 📌 2. 팀원 등록 (POST /members)
app.post("/members", (req, res) => {
    const { name, role, workStyle, mbti, hobby, goal, photo } = req.body;
    if (!name || !role) return res.status(400).json({ error: "이름과 역할은 필수 입력값입니다." });

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "파일을 읽을 수 없습니다." });

        let members = JSON.parse(data);
        const newMember = { id: Date.now(), name, role, workStyle, mbti, hobby, goal, photo };
        members.push(newMember);

        fs.writeFile(DATA_FILE, JSON.stringify(members, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "파일을 저장할 수 없습니다." });
            res.status(201).json(newMember);
        });
    });
});

// 📌 3. 팀원 삭제 (DELETE /members/:id)
app.delete("/members/:id", (req, res) => {
    const memberId = parseInt(req.params.id);

    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "파일을 읽을 수 없습니다." });

        let members = JSON.parse(data);
        const newMembers = members.filter(member => member.id !== memberId);

        fs.writeFile(DATA_FILE, JSON.stringify(newMembers, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "파일을 저장할 수 없습니다." });
            res.json({ message: "삭제 완료", id: memberId });
        });
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
