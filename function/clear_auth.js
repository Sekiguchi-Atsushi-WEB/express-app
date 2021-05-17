//■ 有効期限切れのauthレコードをテーブルから削除するモジュール
//MySQLデータベース接続設定(db_connect.js)の読み込み
const db_connect = require('./db_connect')
//処理をエクスポートする
exports.clear = function() {
  //SQL文を生成
  let sql_deleteToken = 'DELETE FROM auth WHERE limit_time < CURRENT_TIMESTAMP'
  //有効期限切れのauthレコードをテーブルから削除するクエリを実行
  db_connect.connection.query(sql_deleteToken, (err, result, fields) => {
    //if (err) console.log('delete token query is error.')  //クエリエラー時にはエラーメッセージを表示
    //console.log(result.affectedRows)  //削除したレコード数を表示する
  })
}