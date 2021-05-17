//user_loginエンドポイントへのリクエスト処理（ログイン）

//モジュール読み込み
const express = require('express')
const router = express.Router()

//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('../function/db_connect')
//トークン発行処理モジュール(token.js)の読み込み
const token = require('../function/token')


//[1]「/user_login」へのPOSTアクセス（ログイン処理）
router.post('/', (req, res, next) => {
  //ログイン名とパスワードをパラメータから取得する
  let login_name = req.body.login_name
  let password = req.body.password
  
  //SQL文を定義。該当のlogin_nameとパスワードの値を持つidの個数とその氏名を取得する。（値の指定はプレースホルダーにする）
  let sql_login = 'SELECT COUNT(id) AS cnt, id, nickname FROM users WHERE login_name=? AND password=?'

  //クエリを実行（値を第二引数に与えている）
  db_connect.connection.query(sql_login, [login_name, password], (err, result, fields) => {
    //エラー時
    if (err) throw err
    
    //成功時
    //結果によって場合分けする
    if(result[0].cnt == 1){  //クエリ結果の数が1なら、ログイン名とパスワードの組み合わせが存在する（ログイン成功処理）
      //クエリ結果から、ID、ニックネームを取得する
      let user_id = result[0].id
      let nickname = result[0].nickname
      
      //トークンを発行する関数を実行する。（この関数の中で、成功結果をレスポンスしている。処理内容は「/function/token.js」を参照）
      token.issueToken(req, res, next, user_id, login_name, nickname, 'login')
      
    }else{  //それ以外なら、ログイン名とパスワードが正しくない（ログイン失敗処理）
      res.json({ login: 'faild' })  //loginの値にfaildをリターンする
    }
  })
})


//[2]「/user_login/logout」へのGETアクセス（ログアウト処理）
router.get('/logout', (req, res, next) => {
  //リクエストヘッダーからtokenを取得する
  let token = req.headers.token
  
  //SQL文を定義
  let sql_logout = 'DELETE FROM auth WHERE token=?'
  
  //該当トークンのレコードを削除するクエリを実行
  db_connect.connection.query(sql_logout, [token], (err, result, fields) => {
    //クエリエラー時
    if (err) throw err
    //クエリ成功時
    //console.log('token of auth is deleted')
  })
  res.json({ logout: 'OK' })  //クエリの成功失敗に関わらず、「OK」を返す
})


module.exports = router