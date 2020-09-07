# express-crud
node.jsのwebフレームワークの1つである[express](https://expressjs.com/)で簡単にcrudを書いてみました。

初学者向けの簡単なものです。

## 作成手順
一応伝える資料のため、この制作物の作成手順を書いておきます。
最初から順を追って作ってみたい人向け

dockerの説明は他の人がやるので省略してます

1. npmでnode環境を作る
```bash
$ mkdir express-crud
$ cd !$
$ npm init
# 初期化のためにいろいろ聞かれるので答える（ほとんどenter押すだけ）
$ npm install --save express # expressをインストール
```

2. Hello worldが動くかな
公式の[Gettig started](https://expressjs.com/en/starter/hello-world.html)を拝借してindex.jsに貼り付ける

```bash
$ node index.js
Example app listening at http://localhost:3000
```
```bash
# 別のターミナルで
$ curl  http://localhost:3000
Hello World!
```

3. Dockerで動かしてみるよ〜
    - 適当にdocker-compose.ymlを作る
        - 現時点ではdb不要なのでL13までコピペでOK
        - launch.shも使うので書いておく
            - 立ち上げたdocker環境に必要なものをインストールする作業と、その準備ができたら起動するスクリプト
    - わかりやすいようにディレクトリ構造を変えておく
    ```bash
    $ tree -I node_modules # node_modulesは探索しない
    .
    ├── README.md
    ├── docker-compose.yml
    └── src
        ├── index.js
        ├── launch.sh
        ├── node_modules(本当は書かれてないよ)
        ├── package-lock.json
        └── package.json
    ```
    - docker起動
    ```bash
    $ docker-compose up -d
    $ curl http://localhost:30000
    ```
    ※ docker-composeファイルでdockerのport3000番をローカルの30000番に繋いでることに注意　（`30000:3000`）
    
4. dockerにdatabaseも入れてみる
    - 3で作ったdocker-compose.ymlにdbの情報も書く
        - volumesのところだけまだ書かない
    - 立ち上げる
    ```bash
    $ docker-compose up -d
    ```
    - 接続できるか確認
    ```bash
    # dockerの中に接続する時はhostとportを指定する必要がある
    $ mysql -h 127.0.0.1 -P 3306 -u root -p
    # passwordはsecret
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | crud               |
    | mysql              |
    | performance_schema |
    | sys                |
    +--------------------+
    ```
    crudと言うdatabaseが作られてたらok
    
    - 立ち上げ時に自動で初期化してくれるようにする
    ```bash=
    $ mkdir mysql
    $ touch ./mysql/init.sql
    ```
    - init.sql
    ```sql:init.sql=
    use crud;

    CREATE TABLE todos (
        id INT AUTO_INCREMENT NOT NULL, 
        name VARCHAR(32) NOT NULL,
        PRIMARY KEY (id)
    );
    ```
    - 上で焦らしたvolumesも追記する
    - tableができてるか確認する
        - docker立ち上げて〜
        - mysql接続して〜
        - table確認
        todoが出てきたらok
        ```sql
        mysql> use crud;
        mysql> show tables;
        ```
    
5. nodeから接続できるか確認する
    - mysql2をインストールする
    ```bash
    $ npm install --save mysql2
    ```
    - index.jsに接続処理を書いてみる
    ```javascript=4
    const mysql = require('mysql2/promise')

    const dbConfig = {
        host: 'db',
        user: 'root',
        password: 'secret',
        database: 'crud'
    }

    // 同時に立ち上げるから遅延実行にしておく
    let db;
    setTimeout(() => {
        db = mysql.createConnection(dbConfig)
        console.log(db)
    }, 10000)
    
    //　リクエストして確認したい人用
    app.get('/dbinfo', (req, res) => {
        res.send(db);
    })
    ```
    - docker立ち上げる
    ```bash
    $ docker-compose up
    # エラーなく進めばok
    $ curl http://localhost30000/dbinfo
    # なんかいっぱい情報取れたらok
    ```
6. nodeでdbをいじっていく
   - リクエストを解釈できるようにparserを入れる
   ```bash
   $ npm install --save body-parser
   ```
   ```javascript=5
   const bodyParser = require('body-parser')
   app.use(bodyParser.urlencoded({ extended: true }))
   ```
   - ret's coding
   ※ エラー処理、バリデーション処理は省略してます。
   ```javascript=21
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
   ```
   - リクエストを送ってみる
   ```bash
   $ curl http://localhost:30000/todos/
   $ curl http://localhost:30000/todos/1
   $ curl -XPOST -d 'title=hoge' http://localhost:30000/todos
   $ curl -XPUT -d 'title=fooo' http://localhost:30000/todos/1
   $ curl -XDELETE  http://localhost:30000/todos/1
   ```