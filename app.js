//モジュールの読み込み
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

//ルーターモジュールの読み込み
const getDiariesRouter = require('./routes/get_diaries')
const getOneDiaryRouter = require('./routes/get_one_diary')
const editCreateRouter = require('./routes/edit_create')
const editUpdateRouter = require('./routes/edit_update')
const editDeleteRouter = require('./routes/edit_delete')
const userRegistRouter = require('./routes/user_regist')
const userLoginRouter = require('./routes/user_login')
const userAuthRouter = require('./routes/user_auth')
const userDeleteRouter = require('./routes/user_delete')

//appインスタンスの生成
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
//app.set('view engine', 'ejs')

//プラグインの設定
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))


//SQLエンドポイントのルーティング設定
app.use('/get_diaries', getDiariesRouter)  //一ヶ月分の日記データを取得する
app.use('/get_one_diary', getOneDiaryRouter)  //一日分の日記データを取得する
app.use('/edit_create', editCreateRouter)  //日記を作成する
app.use('/edit_update', editUpdateRouter)  //日記を更新する
app.use('/edit_delete', editDeleteRouter)  //日記を削除する
app.use('/user_regist', userRegistRouter)  //ユーザー登録する
app.use('/user_login', userLoginRouter)  //ログインする
app.use('/user_auth', userAuthRouter)  //トークンを延長する
app.use('/user_delete', userDeleteRouter)  //ユーザーを削除する


//historyモードのリロード問題のための対応処理
app.use('*', (req, res, next) => {  //SQLエンドポイント以外の全てのアクセスは、ルートへリダイレクトする
  res.redirect('/?urlpathstr=' + req.originalUrl)  //ルートにリダイレクトする際、パスパラメータを取得して、クエリパラメータとしてURLに付与する
})


//認証情報の更新処理（有効期限切れのauthレコードをテーブルから削除する）
const clear_auth = require('./function/clear_auth')  //モジュールを読み込み
setInterval(clear_auth.clear, 60*1000)  //1分毎に処理を実行する


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
