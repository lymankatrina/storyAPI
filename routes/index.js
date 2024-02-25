const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
// bring in model
const Story = require('../models/Story')

// @desc    Login/Landing page, Authenticate with Google
// @route   GET /auth/google
router.get('/', ensureGuest, (req, res) => {
  res.render('Login', {
    layout: 'login'
  })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean()// bring in object for use with handlebars
    res.render('dashboard', {
      name: req.user.firstName,
      stories
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
