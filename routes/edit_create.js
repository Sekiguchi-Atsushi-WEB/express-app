//edit_createエンドポイントへのリクエスト処理（日記を作成）

//モジュール読み込み
const express = require('express')
const router = express.Router()

//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('../function/db_connect')

//POSTアクセス処理
router.post('/:ymdNo', (req, res, next) => {
  //■ トークンからユーザーIDを特定する処理を実行する
  //リクエストヘッダーからtokenを取得する
  let token = req.headers.token
  
  //トークンからユーザーIDを特定するSQL文を定義（tokenの値からuser_idとlimit_timeを取得する）
  let sql_auth = 'SELECT user_id, limit_time FROM auth WHERE token=?'
  
  //トークンからユーザーIDを特定するクエリを実行
  db_connect.connection.query(sql_auth, [token], (err, result, fields) => {
    //クエリエラー時
    if (err) throw err
    
    //クエリ成功時
    //tokenが期限切れでないかを確認する
    let limitTime = result[0].limit_time  //tokenの期限
    if(limitTime < new Date() || limitTime == null) {  //もし期限切れなら
      //認証結果が「期限切れである」という情報を返す
      res.json({ auth: 'expired' })  //jsonでauthの値「expired」をリターンする（expired = 期限切れ）
    }else{  //期限切れでなければ、日記挿入の処理に移行する
      //user_idを取得する
      let userId = result[0].user_id
      
      //ymdNoを取得する
      let ymdNo = req.params.ymdNo
      
      //日記の挿入処理
      //ymdNoがユニークかどうかチェックする関数を実行する
      checkUniqueYmdNo(req, res, next, userId, ymdNo)
    }
  })
})

//■ ymdNoがユニークかどうかチェックする関数（同じymdNoが既に存在していないか確認する）
function checkUniqueYmdNo(req, res, next, userId, ymdNo) {
  
  //axiosからPOSTされたdiary_textを取得する
  let diaryText = req.body.diary_text
  
  //日記取得のSQL文を定義。既存のymd_noとかぶっていないかをクエリする
  let sql_checkUniqueYmdNo = 'SELECT diary_text FROM diaries WHERE user_id=? AND ymd_no=?'

  //日記取得のクエリを実行（userIdとYmdNoを第二引数に与えている）
  db_connect.connection.query(sql_checkUniqueYmdNo, [userId, ymdNo], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err  //エラーを投げる
    
    //●クエリ成功時
    //クエリ結果の日記があるかないかで、場合分けする
    if(result.length > 0) {  //クエリ結果の日記があるなら、「存在する」という回答をリターンする
      res.json({ sql_query: 'existed' })  //sql_queryの値にexistedをリターンする
      
    } else {  //クエリ結果の日記がないなら、日記データを挿入する関数を実行する
      insertDiary(req, res, next, userId, ymdNo, diaryText)  //日記データを挿入する関数を実行する
    }
  })
}

//■ 日記データを挿入する関数
function insertDiary(req, res, next, userId, ymdNo, diaryText) {
  
  //日記取得のSQL文を定義
  let sql_insertDiary = 'INSERT INTO diaries (id, diary_text, user_id, ymd_no, created, modified) VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'

  //日記取得のクエリを実行（diaryTextとuserIdとlikeYmdNoを第二引数に与えている）
  db_connect.connection.query(sql_insertDiary, [diaryText, userId, ymdNo], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err 
    
    //●クエリ成功時
    //認証結果が「使用可能である」という情報と、成功したという情報をリターンする
    res.json({ auth: 'available', sql_query: 'success' });  //sql_queryの値にsuccessをリターンする
  })
}

module.exports = router