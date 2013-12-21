express  = require "express"
http     = require "http"
path     = require "path"
passport = require "passport"
site     = require "./routes/site"
oauth2   = require "./routes/oauth2"

app = express()
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express.logger()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use passport.initialize()
  app.use passport.session()
  app.use app.router
  app.use express.static(path.join(__dirname, "public"))

require "./auth.js"

app.get  "/",           site.indexPage
app.get  "/login.html", site.loginPage
app.post "/login",      site.login
app.get  "/account",    site.account

app.get  "/dialog/authorize",          oauth2.authorization
app.post "/dialog/authorize/decision", oauth2.decision
app.post "/oauth2/token",              oauth2.token

http.createServer(app).listen 3000
