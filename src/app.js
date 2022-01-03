import express from 'express';
import path  from 'path';

const port = 4000;
const __dirname = path.resolve();
const app = express();

app.get('/',function(req,res){
    // 응답.send('여기는 나의 작업용 페이지입니다.');
    res.sendFile(__dirname + '/pay.html');
});

app.post('/webhook',function(req,res){
    // 응답.send('여기는 나의 작업용 페이지입니다.');
   console.log('webhook test');
   res.send({status : 200});
});

app.listen(port, () => {
    console.log(`App listening on the port ${port}`);
});
