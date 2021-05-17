//user_authエンドポイントへのリクエスト処理（トークンの延長）

//モジュール読み込み
const express = require('express')
const router = express.Router()

//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('../function/db_connect')


//[1]GETアクセス処理
router.get('/', (req, res, next) => {
  //リクエストヘッダーからtokenを取得する
  let token = req.headers.token
  
  //トークンからユーザーIDを特定するSQL文を定義（tokenの値からidの個数とlimit_timeを取得する）
  let sql_auth = 'SELECT COUNT(id) AS cnt, limit_time FROM auth WHERE token=?'
  
  //トークンからユーザーIDを特定するクエリを実行
  db_connect.connection.query(sql_auth, [token], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err
    
    //●クエリ成功時
    //結果によって場合分けする
    if(result[0].cnt == 1){  //クエリ結果の数が1なら、該当トークンがauthテーブルに存在する（認証成功）
      //トークンが存在するなら、次にトークンの有効期限を確認する
      //トークンの有効期限を取得
      let limitTime = result[0].limit_time
      
      //トークンの有効期限が切れているかどうかで場合分けする
      //もし期限切れならば、トークン有効期限切れの処理を行う
      if(limitTime < new Date() || limitTime == null) {
        //トークンのレコードを削除する関数[2]を実行する
        deleteToken(req, res, next, token)
      //もし有効期限内ならば、トークンの延長処理を行う
      }else{
        //トークンの有効期限を延長する関数[3]を実行する
        extendToken(req, res, next, token)
      }
      
    }else{  //クエリ結果の数が1以外なら、該当トークンがauthテーブルに存在しない（認証不整合）
      //認証失敗の情報を返す
      res.json({ auth: 'faild' })  //authの値にfaildをリターンする
    }
  })
})

//[2]トークンのレコードを削除する関数
function deleteToken(req, res, next, token) {
  //SQL文を定義
  let sql_delToken = 'DELETE FROM auth WHERE token=?'
  
  //トークンのレコードを削除するクエリを実行
  db_connect.connection.query(sql_delToken, [token], (err, result, fields) => {
    //クエリエラー時
    if (err) throw err
    //クエリ成功時
    res.json({ auth: 'faild' })  //authの値にfaildをリターンする
  })
}

//[3]トークンの有効期限を延長する関数
function extendToken(req, res, next, token) {
  //SQL文を定義（トークンの有効期限を現在時刻より二時間延長する）
  let sql_extendToken = 'UPDATE auth SET limit_time = CURRENT_TIMESTAMP + INTERVAL 2 HOUR WHERE token=?'
  
  //トークンのレコードを削除するクエリを実行
  db_connect.connection.query(sql_extendToken, [token], (err, result, fields) => {
    //クエリエラー時
    if (err) throw err
    //クエリ成功時
    res.json({ auth: 'success' })  //authの値にsuccessをリターンする
  })
}

module.exports = router