//データベース接続オブジェクトを作成するモジュール

//mysqlモジュールの読み込み
const mysql = require('mysql')  

//AWSのRDSへのDB接続オブジェクトを定義
const connection02 = mysql.createConnection({
  host     : '************',  //接続先ホスト
	database : '****',   //DB名
  user     : '****',    //ユーザー名
  password : '****'   //パスワード
})


//DB接続オブジェクトをconnectionとしてエクスポート（connection01または02を場合によって切り替えて代入する）
exports.connection = connection02