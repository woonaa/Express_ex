const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');


const topicRouter = require('./routes/topic');
const indexRouter = require('./routes/index');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());

// app.use를 사용하면 되지만 post형식에서 필요없는데 미들웨어를 불러오는 것은 비효율
// 그래서 get으로 변경 후, '*'모든 요청 명령어를 넣는다.
// post는 만든 미들웨어를 불러오지 않고 get 형식의 모든 요청은 미들웨어를 사용한다.

app.get('*', function (request, response, next) {
    fs.readdir('./data', function(error, filelist){
        request.list = filelist;
        next();
    })
});

app.use('/', indexRouter);
app.use('/topic', topicRouter);

app.use(function(request, response, next) {
    response.status(404).send('sorry cant find that!');
});

app.use(function(err, request, response, next){
    console.error(err.stack);
    response.status(500).send('Something broke');
});

app.listen(3000, function () {
    console.log("port 3000!")
});

