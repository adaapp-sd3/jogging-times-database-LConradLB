var express = require('express')
var bcrypt = require('bcrypt')

var User = require('./models/User')
var UserMetadata = require('./models/UserMetadata')
var Jog = require('./models/Jog')
var Utility = require('./Utility')

var routes = new express.Router()

var saltRounds = 10

function formatDateForHTML(date) {
  return new Date(date).toISOString().slice(0, -8)
}

// main page
routes.get('/', function (req, res) {
  if (req.cookies.userId) {
    // if we've got a user id, assume we're logged in and redirect to the app:
    res.redirect('/times')
  } else {
    // otherwise, redirect to login
    res.redirect('/sign-in')
  }
})

// show the create account page
routes.get('/create-account', function (req, res) {
  res.render('create-account.html')
})

// handle create account forms:
routes.post('/create-account', function (req, res) {
  var form = req.body

  // TODO: add some validation in here to check
  if (!form.email.includes("@") || !form.email.includes(".")) {
    res.redirect('/create-account', { error: "Please enter a valid email" })
    return;
  }

  // hash the password - we dont want to store it directly
  var passwordHash = bcrypt.hashSync(form.password, saltRounds)

  // create the user
  var userId = User.insert(form.name, form.email, passwordHash)

  // set the userId as a cookie
  res.cookie('userId', userId)

  // redirect to the logged in page
  res.redirect('/times')
})

// show the sign-in page
routes.get('/sign-in', function (req, res) {
  res.render('sign-in.html')
})

routes.post('/sign-in', function (req, res) {
  var form = req.body

  // find the user that's trying to log in
  var user = User.findByEmail(form.email)

  // if the user exists...
  if (user) {
    if (bcrypt.compareSync(form.password, user.passwordHash)) {
      // the hashes match! set the log in cookie
      res.cookie('userId', user.id)
      // redirect to main app:
      res.redirect('/times')
    } else {
      // if the username and password don't match, say so
      res.render('sign-in.html', {
        errorMessage: 'Email address and password do not match'
      })
    }
  } else {
    // if the user doesnt exist, say so
    res.render('sign-in.html', {
      errorMessage: 'No user with that email exists'
    })
  }
})

// handle signing out
routes.get('/sign-out', function (req, res) {
  // clear the user id cookie
  res.clearCookie('userId')

  // redirect to the login screen
  res.redirect('/sign-in')
})

routes.get('/delete', function (req, res) {
  User.delete(req.cookies.userId)
  // clear the user id cookie
  res.clearCookie('userId')
  // redirect to the login screen
  res.redirect('/sign-in')
})


// list all jog times
routes.get('/times', function (req, res) {

  var loggedInUser = User.findById(req.cookies.userId)

  const addition = (accumulator, currentValue) => accumulator + currentValue;

  try {
    var totalDistance = (Jog.findAllByUserID(req.cookies.userId)).map(jog => {
      return jog.distance
    }).reduce(addition)
    var avgSpeed = ((Jog.findAllByUserID(req.cookies.userId)).map(jog => { return jog.distance}).reduce(addition) / Jog.findAllByUserID(req.cookies.userId).map(jog => { return jog.duration }).reduce(addition))
    var totalTime = (Jog.findAllByUserID(req.cookies.userId)).map(jog => {
      return jog.duration
    }).reduce(addition)
    UserMetadata.modifyUserMetadata(req.cookies.userId, totalDistance, totalTime, avgSpeed)
  } catch (error) {
    console.log("error", error)
    var totalDistance = 0
    var avgSpeed = 0
    var totalTime = 0
  }

  var allJogData = Jog.findAllByUserID(req.cookies.userId)

  try {
    allJogData.map(obj => {
      obj.avgSpeed = obj.distance / obj.duration;
      return obj;
    })
  } catch (error) { }

  res.render('list-times.html', {
    user: loggedInUser,
    stats: {
      totalDistance: totalDistance.toFixed(2),
      totalTime: totalTime.toFixed(2),
      avgSpeed: avgSpeed.toFixed(2)
    },

    // show all times
    times: allJogData
  })
})

// show the create time form
routes.get('/times/new', function (req, res) {
  // this is hugely insecure. why?
  var loggedInUser = User.findById(req.cookies.userId)

  res.render('create-time.html', {
    user: loggedInUser
  })
})

// handle the create time form
routes.post('/times/new', function (req, res) {
  var form = req.body

  console.log('create time', form)
  // TODO: save the new time
  var newJog = Jog.insert(form.startTime, form.duration, form.distance, req.cookies.userId)

  res.redirect('/times')
})

// show the edit time form for a specific time
routes.get('/times/:id', function (req, res) {
  var timeId = req.params.id
  var user = User.findById(req.cookies.userId)
  var jogData = Jog.findById(timeId)
  // TODO: get the real time for this id from the db
  var jogTime = {
    id: timeId,
    startTime: jogData.date,
    duration: jogData.duration,
    distance: jogData.distance
  }

  res.render('edit-time.html', {
    user: user,
    time: jogTime
  })
})

// handle the edit time form
routes.post('/times/:id', function (req, res) {
  var timeId = req.params.id
  var form = req.body

  Jog.updateJogById(form.startTime, form.duration, form.distance, timeId)

  // TODO: edit the time in the db

  res.redirect('/times')
})

// handle deleteing the time
routes.get('/times/:id/delete', function (req, res) {
  var timeId = req.params.id

  // TODO: delete the time
  Jog.deleteTimeByID(timeId)

  res.redirect('/times')
})

// list all users
routes.get('/users', function (req, res) {

  var loggedInUser = User.findById(req.cookies.userId)
  var allUsers = User.selectAllUsers()
  var allFollowers = User.getFollowing(req.cookies.userId)
  var jogData = Jog.getAllFollowingJogs(req.cookies.userId)

  jogData.forEach(function(run) {
    run.month = Utility.parseMonth(run['strftime("%m",jog.date)'])
    run.day = run['strftime("%d",jog.date)']
    run.year = run['strftime("%Y",jog.date)']
  })

  console.log(jogData)

  for (var user in allUsers){
    if(allUsers[user].id == loggedInUser.id){
      allUsers[user].isFollowed = "You can't follow yourself"
      //Remove self from array
    }else{
      if(User.isFollowingUser(loggedInUser.id, allUsers[user].id) == 1){
        allUsers[user].isFollowed = "Following"
      }else{
        allUsers[user].isFollowed = "Follow"
      }
    }
  }

  res.render('list-users.html', {
    user: loggedInUser,
    // show all users
    users: allUsers,
    followers: allFollowers,
    allJogs: jogData
  })

  console.log("Followers",allFollowers)
})


routes.get('/follow/:id', function (req, res) {
  var targetFollowerId = req.params.id

  // TODO: delete the time
  User.followUser(req.cookies.userId, req.params.id)

  res.redirect('/users')
})

// show the edit time form for a specific time
routes.get('/rankings-distance', function (req, res) {
  var user = User.findById(req.cookies.userId)
  // TODO: get the real time for this id from the db
  var distanceRanking = UserMetadata.retrieveFollowersJogsByDistance(user.id)
  var userData = UserMetadata.retrieveUserMetadata(user.id)
  userData.value = userData.totalDistance
  distanceRanking.push(userData)
  distanceRanking.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0)); 
  console.log("ranking", distanceRanking)
  res.render('list-rankings.html', {
    user: user,
    ranking: distanceRanking,
    sortedby: "Distance"
  })
})

routes.get('/rankings-duration', function (req, res) {
  var user = User.findById(req.cookies.userId)
  // TODO: get the real time for this id from the db
  var distanceRanking = UserMetadata.retrieveFollowersJogsByTime(user.id)
  var userData = UserMetadata.retrieveUserMetadata(user.id)
  userData.value = userData.totalDuration
  distanceRanking.push(userData)
  distanceRanking.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0)); 
  console.log("ranking", distanceRanking)
  res.render('list-rankings.html', {
    user: user,
    ranking: distanceRanking,
    sortedby: "Duration"
  })
})

routes.get('/rankings-speed', function (req, res) {
  var user = User.findById(req.cookies.userId)
  // TODO: get the real time for this id from the db
  var distanceRanking = UserMetadata.retrieveFollowersJogsBySpeed(user.id)
  var userData = UserMetadata.retrieveUserMetadata(user.id)
  userData.value = userData.averageSpeed
  distanceRanking.push(userData)
  distanceRanking.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0)); 
  console.log("ranking", distanceRanking)
  res.render('list-rankings.html', {
    user: user,
    ranking: distanceRanking,
    sortedby: "Speed"
  })
})

module.exports = routes