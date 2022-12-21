const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');
const jwt = require('jsonwebtoken')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const JWT_KEY = 'Authorization';
const config = process.env;
config.JWT_SECRET = 'secrety secret';

app.use((req, res, next) => {
    let token = req.get(JWT_KEY);

    if (token) {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.user = decoded;
        } catch (err) {

            console.log(err);
        }
    }

    next();
});

app.get('/', (req, res) => {
    if (req.user) {
        return res.json({
            username: req.user.name,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/logout', (req, res) => {
    delete req.headers[JWT_KEY]
});

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false
    });

    if (user) {
        const token = jwt.sign(
            { name: login },
            config.JWT_SECRET,
            {
              expiresIn: "5m",
            }
          );

        res.set(JWT_KEY, token)
        res.json({ 'token': token });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
