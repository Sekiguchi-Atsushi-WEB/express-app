//user_deleteエンドポイントへのリクエスト処理（登録済みユーザーの削除）

//モジュール読み込み
const { response } = require('express')
const express = require('express')
const router = express.Router()

//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('../function/db_connect')


//[1-a]「/user_delete/confirm」へのGETアクセス処理（ユーザー削除前の情報確認）
router.get('/confirm', (req, res, next) => {
  //■ トークンからユーザーIDを特定する処理を実行する
  //リクエストヘッダーからtokenを取得する
  let token = req.headers.token
  
  //トークンからユーザーIDを特定するSQL文を定義
  let sql = 'SELECT user_id FROM auth WHERE token=?'
  
  //トークンからユーザーIDを特定するクエリを実行
  db_connect.connection.query(sql, [token], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err
    
    //●クエリ成功時
    //結果からユーザーIDを取得する
    user_id = result[0].user_id
    //ログイン名とニックネームを取得して返す関数[1-b]を実行する
    responseLoginName(req, res, next, user_id)
  })
})

//[1-b]ログイン名とニックネームを取得して返す関数
function responseLoginName(req, res, next, user_id) {
  //ユーザーIDからログイン名とニックネームとidを取得するSQL文を定義
  let sql = 'SELECT login_name, nickname, id FROM users WHERE id=?'
  
  //ユーザーIDからログイン名とニックネームを取得するクエリを実行
  db_connect.connection.query(sql, [user_id], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err
    
    //●クエリ成功時
    //結果からログイン名とニックネームを取得する
    let login_name = result[0].login_name
    let nickname = result[0].nickname
    let user_id = result[0].id
    
    //ログイン名とニックネームとユーザーIDをJSON形式で返す
    res.json({ login_name: login_name, nickname: nickname, user_id: user_id })
  })
}


//[2-a]「/user_delete」へのPOSTアクセス処理（ユーザーの削除）
router.post('/', (req, res, next) => {
  //リクエストからuser_idを取得する
  let user_id = req.body.user_id
  
  //usersテーブルからユーザーを削除するSQL文を定義
  let sql = 'DELETE FROM users WHERE id=?'
  
  //usersテーブルからユーザーを削除するクエリを実行
  db_connect.connection.query(sql, [user_id], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err
    
    //●クエリ成功時
    //成功したという情報を返す
    res.json({ delete_user: 'success' })
    //削除対象ユーザーの日記とトークンを削除する関数[2-b]を実行する
    delete_all_info(user_id)
  })
})

//[2-b]削除対象ユーザーの日記とトークンを削除する関数
function delete_all_info(user_id) {
  //diariesテーブルから対象ユーザーの日記を全て削除するクエリを実行
  db_connect.connection.query('DELETE FROM diaries WHERE user_id=?', [user_id], (err, result, fields) => {
    if (err) throw err  //クエリエラー時にはエラーを投げる
  })
  
  //対象ユーザーのトークンを削除するクエリを実行
  db_connect.connection.query('DELETE FROM auth WHERE user_id=?', [user_id], (err, result, fields) => {
    if (err) throw err  //クエリエラー時にはエラーを投げる
  })
}


module.exports = router