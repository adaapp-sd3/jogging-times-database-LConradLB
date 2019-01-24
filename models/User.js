var db = require('../database')

// get the queries ready - note the ? placeholders
var insertUser = db.prepare(
  'INSERT INTO user (name, email, password_hash) VALUES (?, ?, ?)'
)

var followUser = db.prepare(
  'INSERT INTO following (sourceUserId, targetUserId) VALUES (?, ?)'
)

var checkIfFollowingUser = db.prepare(
  'SELECT EXISTS (SELECT 1 FROM following WHERE sourceUserId = ? AND targetUserId = ?)'
)

//GET THE ACTUAL USERS FROM THE USERS TABLE
//var getFollowing = db.prepare('SELECT sourceUserId FROM following where targetUserId = ?')

var getFollowing = db.prepare('SELECT * FROM user INNER JOIN following ON user.id = following.sourceUserId WHERE targetUserId = ?')

var unfollowUser = db.prepare('DELETE FROM following WHERE sourceUserId = ? AND targetUserId = ?')

var selectUserById = db.prepare('SELECT * FROM user WHERE id = ?')

var selectUserByEmail = db.prepare('SELECT * FROM user WHERE email = ?')

var deleteUserById = db.prepare('DELETE FROM user WHERE id = ?')

var selectAllUsers = db.prepare('SELECT name, id FROM user')

var countFollowOfTarget = db.prepare('SELECT count(*) FROM following WHERE sourceUserID = ? AND targetUserID = ?')


class User {
  static insert(name, email, passwordHash) {
    // run the insert query
    var info = insertUser.run(name, email, passwordHash)

    // check what the newly inserted row id is
    var userId = info.lastInsertRowid

    return userId
  }

  static findById(id) {
    var row = selectUserById.get(id)

    if (row) {
      return new User(row)
    } else {
      return null
    }
  }

  static findByEmail(email) {
    var row = selectUserByEmail.get(email)

    if (row) {
      return new User(row)
    } else {
      return null
    }
  }

  static delete(userId){
    deleteUserById.run(userId)
  }

  static selectAllUsers(){
    return selectAllUsers.all()
  }

  constructor(databaseRow) {
    this.id = databaseRow.id
    this.name = databaseRow.name
    this.email = databaseRow.email
    this.passwordHash = databaseRow.password_hash
  }

  static followUser(origin, target) {
    // run the insert query
    var count = countFollowOfTarget.get(origin, target)
    let value = count['count(*)']
    if(origin != target){
      if(value < 1){
        followUser.run(origin, target)
      }else{
        User.unfollowUser(origin, target)
      }
    }
  }

  static unfollowUser(origin, target) {
    var count = countFollowOfTarget.get(origin, target)
    let value = count['count(*)']

    // run the insert query
    if(value == 1){
      unfollowUser.run(origin, target)
    }
  }

  static isFollowingUser(origin, target) {
    let check = checkIfFollowingUser.get(origin, target)['EXISTS (SELECT 1 FROM following WHERE sourceUserId = ? AND targetUserId = ?)']
    return check
  }

  static getFollowing(origin){
    return getFollowing.all(origin)
  }
}

module.exports = User
