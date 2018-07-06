const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');
const bodyParser = require('body-parser');
const compression = require('compression');
const template = require('./lib/template.js');

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


//route, routing
//app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function (request, response) {
    const title = 'Welcome';
    const description = 'Hello, Node.js';
    const list = template.list(request.list);
    const html = template.HTML(title, list,
        `<h2>${title}</h2>${description}
        <img src = "/images/ow.jpg" style="width : 600px; display : block;">`,
        `<a href="/create">create</a>`
    );
    response.send(html);
});

app.get('/page/:pageId', function(request, response, next){
    const filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
        if(err) {
            next(err);
        } else {
            const title = request.params.pageId;
            const sanitizedTitle = sanitizeHtml(title);
            const sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            const list = template.list(request.list);
            const html = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.send(html);
        }
    });
});

app.get('/create', function (request, response) {
    const title = 'WEB - create';
    const list = template.list(request.list);
    const html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.send(html);
});

app.post('/create_process', function (request, response) {
    const post = request.body;
    const title = post.title;
    const description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect('/?id=${title}');
    })
});

app.get('/update/:pageId', function (request, response) {
    const filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        const title = request.params.pageId;
        const list = template.list(request.list);
        const html = template.HTML(title, list,
            `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
            `<a href="/create">create</a> <a href="/update/${title}">update</a>`
        );
        response.send(html);
    });
});

app.post('/update_process', function (request, response) {
    const post = request.body;
    const id = post.id;
    const title = post.title;
    const description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.redirect('/?id=${title}');
        })
    });
});

app.post('/delete_process', function (request, response) {
    const post = request.body;
    const id = post.id;
    const filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
        response.redirect('/');
    })
});

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

