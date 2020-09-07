const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')

// postとかできるようにする
app.use(bodyParser.urlencoded({ extended: true }))

const dbConfig = {
    host: 'db',
    user: 'root',
    password: 'secret',
    database: 'crud'
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// 全件取得
app.get('/todos', async (req, res) => {
    const db = await mysql.createConnection(dbConfig)
    const [row] = await db.query('select * from `todos`')
    res.send(row)
})

// データ追加
app.post('/todos', async (req, res) => {
    const db = await mysql.createConnection(dbConfig)
    const [row] = await db.query('insert into `todos` set ?', req.body)
    res.send('ok')
})

// 1つだけ取得
app.get('/todos/:id', async (req, res) => {
    const db = await mysql.createConnection(dbConfig)
    const [row] = await db.query('select * from `todos` where id = ?', req.params.id)
    res.send(row)
})

// 任意のデータを書き換える
app.put('/todos/:id', async (req, res) => {
    const db = await mysql.createConnection(dbConfig)
    const [row] = await db.query('update `todos` set title = ? where id = ?',
     [req.body.title, req.params.id])
    res.send('ok')
})

// 任意のデータを削除する
app.delete('/todos/:id', async (req, res) => {
    const db = await mysql.createConnection(dbConfig)
    const [row] = await db.query('delete from `todos` where id=?', req.params.id)
    res.send('ok')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
