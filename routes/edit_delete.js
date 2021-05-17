//edit_createエンドポイントへのリクエスト処理（日記を削除）

//モジュール読み込み
const express = require('express')
const router = express.Router()

//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('../function/db_connect')

//GETアクセス処理
router.get('/:ymdNo', (req, res, next) => {
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
      //ymdNoが存在するかチェックする関数を実行する
      checkYmdNo(req, res, next, userId, ymdNo)
    }
  })
})

//■ ymdNoが存在するかチェックする関数（1つ存在すれば正しい）
function checkYmdNo(req, res, next, userId, ymdNo) {
  
  //日記取得のSQL文を定義。取得したymd_noでクエリする
  let sql_checkYmdNo = 'SELECT diary_text FROM diaries WHERE user_id=? AND ymd_no=?'

  //日記取得のクエリを実行（userIdとymdNoを第二引数に与えている）
  db_connect.connection.query(sql_checkYmdNo, [userId, ymdNo], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err  //エラーを投げる
    
    //●クエリ成功時
    //クエリ結果の日記があるかないかで、場合分けする
    if(result.length == 1) {  //クエリ結果が1なら、日記が一つ存在するので、削除処理を実行する
      updateDiary(req, res, next, userId, ymdNo)  //日記データを削除する関数を実行する
    } else {  //クエリ結果が1でないなら、条件が合わないので削除しない。「削除しない」という情報を返す。
      res.json({ sql_query: 'not_deleted' })  //sql_queryの値にnot_deletedをリターンする
    }
  })
}

//■ 日記データを削除する関数
function updateDiary(req, res, next, userId, ymdNo) {
  
  //日記削除のSQL文を定義
  let sql_updateDiary = 'DELETE FROM diaries WHERE user_id=? AND ymd_no=?'

  //日記削除のクエリを実行（userIdとlikeYmdNoを第二引数に与えている）
  db_connect.connection.query(sql_updateDiary, [userId, ymdNo], (err, result, fields) => {
    //●クエリエラー時
    if (err) throw err
    
    //●クエリ成功時
    //認証結果が「使用可能である」という情報と、成功したという情報をリターンする
    res.json({ auth: 'available', sql_query: 'success' });  //sql_queryの値にsuccessをリターンする
  })
}

module.exports = router