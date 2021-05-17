//get_one_diaryエンドポイントへのリクエスト処理（一日分の日記を取得）

//モジュール読み込み
const express = require('express')
const router = express.Router()

//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('../function/db_connect')

//GETアクセス処理
router.get('/:ymNo', (req, res, next) => {
  //■ トークンからユーザーIDを特定する処理を実行する
  //リクエストヘッダーからtokenを取得する
  let token = req.headers.token
  
  //トークンからユーザーIDを特定するSQL文を定義（tokenの値からuser_idとlimit_timeを取得する）
  let sql_auth = 'SELECT user_id, limit_time FROM auth WHERE token=?'
  
  //トークンからユーザーIDを特定するクエリを実行
  db_connect.connection.query(sql_auth, [token], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err
    
    //●クエリ成功時
    //tokenが期限切れでないかを確認する
    let limitTime = result[0].limit_time  //tokenの期限
    if(limitTime < new Date() || limitTime == null) {  //もし期限切れなら
      //認証結果が「期限切れである」という情報を返す
      res.json({ auth: 'expired' })  //jsonでauthの値「expired」をリターンする（expired = 期限切れ）
    }else{  //期限切れでなければ
      //user_idを取得する
      let userId = result[0].user_id
      //一日分の日記データを取得する関数を実行する
      getOneDiary(req, res, next, userId)
    }
  })
})

//■ 一日分の日記データを取得する関数
function getOneDiary(req, res, next, userId) {
  //ymd_noを検索する文字列をパラメータから取得して定義する
  let ymdNo = req.params.ymNo

  //日記取得のSQL文を定義（user_idとymd_noのLIKEの指定はプレースホルダーにする）
  let sql_getOneDiary = 'SELECT diary_text FROM diaries WHERE user_id=? AND ymd_no=?'

  //日記取得のクエリを実行（userIdとymdNoを第二引数に与えている）
  db_connect.connection.query(sql_getOneDiary, [userId, ymdNo], (err, result, fields) => {
    //エラー時
    if (err) throw err
    
    //成功時
    //認証結果が「使用可能である」という情報と、クエリ結果をリターンする
    res.json({ auth: 'available', diary_text: result[0].diary_text });  //日記の文章をリターンする
  })
}

module.exports = router