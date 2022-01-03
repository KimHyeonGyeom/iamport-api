import express from 'express';
import path  from 'path';
import axios from "axios";

const port = 4000;
const __dirname = path.resolve();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',function(req,res){
    // 응답.send('여기는 나의 작업용 페이지입니다.');
    res.sendFile(__dirname + '/pay.html');
});

app.post('/webhook',function(req,res){
    // 응답.send('여기는 나의 작업용 페이지입니다.');
   console.log('webhook test');
   res.send({status : 200});
});


app.post("/subscription/issue-billing", async (req, res) => {
    try {
        const {
            card_number, // 카드 번호
            expiry, // 카드 유효기간
            birth, // 생년월일
            pwd_2digit, // 카드 비밀번호 앞 두자리
            customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
        } = req.body; // req의 body에서 카드정보 추출
        // 인증 토큰 발급 받기
        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post", // POST method
            headers: {"Content-Type": "application/json"}, // "Content-Type": "application/json"
            data: {
                imp_key: "imp_apikey", // REST API 키
                imp_secret: "ekKoeW8RyKuT0zgaZsUtXXTLQ4AhPFW3ZGseDA6bkA5lamv9OqDMnxyeB9wqOsuO9W3Mx9YSJ4dTqJ3f" // REST API Secret
            }
        });
        const {access_token} = getToken.data.response; // 인증 토큰
        console.log(access_token)
    }catch (err){
        console.log(err);
    }
})

app.listen(port, () => {
    console.log(`App listening on the port ${port}`);
});
