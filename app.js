const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars').engine
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')

// Load config
dotenv.config({ path: './config/config.env' })

// passport config
require('./config/passport')(passport)

const { connectDb } = require('./config/db')

connectDb()
  .then(() => {
    const app = express()

    // Body parser
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    // Method override
    app.use(
      methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
          // look in urlencoded POST bodies and delete it
          let method = req.body._method
          delete req.body._method
          return method
        }
      })
    )

    // Logging: Set up Morgan middleware to show any requests in console only in development mode
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'))
    }

    // Handlebars Helpers
    const {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select
    } = require('./helpers/hbs')

    // Handlebars
    app.engine(
      '.hbs',
      exphbs({
        helpers: {
          formatDate,
          stripTags,
          truncate,
          editIcon,
          select
        },
        defaultLayout: 'main',
        extname: '.hbs'
      })
    )
    app.set('view engine', '.hbs')

    // Session middleware
    app.use(session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
    }))

    // Passport middleware
    app.use(passport.initialize())
    app.use(passport.session())

    // Set global variable
    app.use(function (req, res, next) {
      res.locals.user = req.user || null
      next()
    })

    // Static Folder for including public assets
    app.use(express.static(path.join(__dirname, 'public')))

    // Routes
    app.use('/', require('./routes/index'))
    app.use('/auth', require('./routes/auth'))
    app.use('/stories', require('./routes/stories'))

    const PORT = process.env.PORT || 3000

    app.listen(
      PORT,
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    )
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err)
    process.exit(1) // Exit the process if database connection fails
  })
