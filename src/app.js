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
    console.time('calculatingTime')
//    for (let i = 0; i < 100; i++) {
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
                    imp_key: "6237782459059600", // REST API 키
                    imp_secret: "eee643eeb1473ff71df7fbbd20745fe674ea9d0516e9c9e6dc4262dec9ef8a4e5004d6173860ce4b" // REST API Secre
                }
            });
            const {access_token} = getToken.data.response; // 인증 토큰
            console.log(access_token);

            // 빌링키 발급 요청
            const issueBilling = await axios({
                url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
                method: "post",
                headers: {"Authorization": access_token}, // 인증 토큰 Authorization header에 추가
                data: {
                    card_number, // 카드 번호
                    expiry, // 카드 유효기간
                    birth, // 생년월일
                    pwd_2digit, // 카드 비밀번호 앞 두자리
                }
            });

            const {code, message} = issueBilling.data;
            if (code === 0) { // 빌링키 발급 성공
                console.log({
                    status: "success",
                    message: "Billing has successfully issued",
                    customer_uid: customer_uid
                });
                //res.send({status: "success", message: "Billing has successfully issued"});
            } else { // 빌링키 발급 실패
                console.log({status: "failed", message});
                // res.send({status: "failed", message});
            }
        } catch
            (e) {
            console.log(e);
            res.status(400).send(e);
        }
  //  }
    let end = new Date();  // 종료
    console.timeEnd('calculatingTime'); //100번 api 호출 시 45초..
    res.send({status: "success", message: "Billing has successfully issued"});
})

app.post("/billings", async (req, res) => {

    // 인증 토큰 발급 받기
    const getToken = await axios({
        url: "https://api.iamport.kr/users/getToken",
        method: "post", // POST method
        headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
        data: {
            imp_key: "6237782459059600", // REST API 키
            imp_secret: "eee643eeb1473ff71df7fbbd20745fe674ea9d0516e9c9e6dc4262dec9ef8a4e5004d6173860ce4b" // REST API Secret
        }
    });
    const { access_token } = getToken.data.response; // 인증 토큰

    const paymentResult = await axios({
        url: `https://api.iamport.kr/subscribe/payments/schedule`,
        method: "post",
        headers: {"Authorization": access_token}, // 인증 토큰 Authorization header에 추가
        data: {
            customer_uid: "gildong_0001_1235", // 카드(빌링키)와 1:1로 대응하는 값
            schedules: [
                {
                    merchant_uid: "order_monthly_0035", // 주문 번호
                    schedule_at: 	1641305598, // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
                    amount: 1000,
                    name: "월간 이용권 정기결제",
                    buyer_name: "홍길동",
                    buyer_tel: "01012345678",
                    buyer_email: "gildong@gmail.com"
                }
            ]
        }
    });
    const { code, message } = paymentResult;
    res.send({status: "success", message: paymentResult.data});
})
app.listen(port, () => {
    console.log(`App listening on the port ${port}`);
});
