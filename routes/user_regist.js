//user_registエンドポイントへのリクエスト処理（ユーザー登録）

//モジュール読み込み
const express = require('express')
const router = express.Router()

//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('../function/db_connect')
//トークン発行処理モジュール(token.js)の読み込み
const token = require('../function/token')


//[1]ログイン名のダブリチェックのアクセス処理。「/user_regist/check_dup」へのPOSTアクセス処理
router.post('/check_dup', (req, res, next) => {
  //ログイン名をパラメータから取得する
  let login_name = req.body.login_name
  
  //SQL文を定義。該当のlogin_nameの値を持つidの個数を取得する。（login_nameの指定はプレースホルダーにする）
  let sql_checkDuplicate = 'SELECT COUNT(id) AS cnt FROM users WHERE login_name=?'

  //クエリを実行（login_nameを第二引数に与えている）
  db_connect.connection.query(sql_checkDuplicate, [login_name], (err, result, fields) => {
    //エラー時
    if (err) throw err
    
    //成功時
    //結果によって場合分けする
    if(result[0].cnt >= 1){  //クエリ結果が1以上なら、ログイン名は使用されている
      res.json({ login_name_info: 'duplicate' })  //login_name_infoの値にduplicate（重複）をリターンする
    }else{  //それ以外なら、ログイン名は使用されていない
      res.json({ login_name_info: 'unique' })  //login_name_infoの値にunique（一意）をリターンする
    }
  })
})


//[2]ユーザー登録のアクセス処理。「/user_regist」へのPOSTアクセス処理
router.post('/', (req, res, next) => {
  //ログイン名、パスワード、ユーザー名をパラメータから取得する
  let login_name = req.body.login_name
  let password = req.body.password
  let nickname = req.body.nickname
  
  //念のため、ログイン名のダブリを実行前にチェックする
  db_connect.connection.query('SELECT COUNT(id) AS cnt FROM users WHERE login_name=?', [login_name], (err, result, fields) => {
    //エラー時
    if (err) throw err
    //成功時
    if(result[0].cnt >= 1){  //クエリ結果が1以上なら、ログイン名は使用されている
      res.json({ regist: 'faild' });  //registの値にfaildをリターンする
    }else{  //それ以外なら、ログイン名は使用されていない
      //ユーザー登録処理の関数を実行する
      registUser(req, res, next, login_name, password, nickname)
    }
  })
})

//ユーザー登録処理の関数
function registUser(req, res, next, login_name, password, nickname) {
  //SQL文を定義。（値の指定はプレースホルダーにする）
  let sql_checkDuplicate = 'INSERT INTO users (id, login_name, nickname, password, created, modified) VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'

  //クエリを実行（値を第二引数に与えている）
  db_connect.connection.query(sql_checkDuplicate, [login_name, nickname, password], (err, result, fields) => {
    //エラー時
    if (err) throw err
    
    //成功時
    //結果から登録したユーザーのidを取得する
    let user_id = result.insertId
    //トークンを発行する関数を実行する。（この関数の中で、成功結果をレスポンスしている。処理内容は「/function/token.js」を参照）
    token.issueToken(req, res, next, user_id, login_name, nickname, 'regist')
  })
}


module.exports = router