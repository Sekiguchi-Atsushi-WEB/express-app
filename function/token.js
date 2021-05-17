//■ トークン発行の処理を実行するモジュール
//user_regist.js と user_login.js にて、このモジュールを読み込んで使用している

//モジュールの読み込み
const db_connect = require('./db_connect')  //MySQLデータベース接続設定(db_connect.js)の読み込み
const crypto = require('crypto')  //cryptoの読み込み

//トークンを発行する処理を、エクスポートする
exports.issueToken = function(req, res, next, user_id, login_name, nickname, request_type) {  //必要な引数を受け取る
  //トークンの値を生成する
  const date = new Date()
  const nowTime_ms = String(date.getFullYear()) + String(date.getMonth()) + String(date.getDate()) + String(date.getHours()) + String(date.getMinutes()) + String(date.getSeconds()) + String(date.getMilliseconds())  //現在日時の文字列（ミリセカンドまで）
  const srcStr = makeRandomStr() + nowTime_ms + login_name  //トークンのソースとなる文字列（ランダム32文字 ＋ 現在日時の文字列 ＋ ログイン名）
  const token = crypto.createHash('sha512').update(srcStr).digest('hex')  //文字列をハッシュ化する
  
  //トークンをauthテーブルに格納する
  //SQL文を生成
  let sql_storeToken = 'INSERT INTO auth (id, user_id, token, limit_time) VALUES (NULL, ?, ?, CURRENT_TIMESTAMP + INTERVAL 2 HOUR)'
  //トークンをauthテーブルに格納するクエリを実行（値を第二引数に与えている）
  db_connect.connection.query(sql_storeToken, [user_id, token], (err, result, fields) => {
    //クエリエラー時
    if (err) throw err 
    
    //クエリ成功時
    //引数「request_type」が「regist」か「login」かで、返却するJSONが少し違うので、場合分けする
    //registの場合
    if(request_type == 'regist'){
      //「成功した」という情報と、ニックネームとトークンを返す
      res.json({ regist: 'success', nickname: nickname, token: token })  //registの値にsuccessを指定し、ニックネームとトークンを合わせてリターンする
    
    //loginの場合
    }else if(request_type == 'login'){
      //「成功した」という情報と、ニックネームとトークンを返す
      res.json({ login: 'success', nickname: nickname, token: token })  //loginの値にsuccessを指定し、ニックネームとトークンを合わせてリターンする
    }
  })
}

//ランダムな文字列を生成する関数
function makeRandomStr(){
  const LENGTH = 32 //生成したい文字列の長さ
  const SOURCE = "abcdefghijklmnopqrstuvwxyz0123456789" //元になる文字
  let str = ''
  for(let i=0; i<LENGTH; i++){
    str += SOURCE[ Math.floor(Math.random() * SOURCE.length) ]
  }
  return str  //生成した文字列を返す
}