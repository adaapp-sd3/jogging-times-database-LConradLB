var db = require('../database')

// get the queries ready - note the ? placeholders
var deleteJog = db.prepare(
  'DELETE FROM jog WHERE ID = ?'
)

var insertJog = db.prepare(
  'INSERT INTO jog (date, duration, distance, userId) VALUES (?, ?, ?, ?)'
)

var getAllJogsWithAllUsers = db.prepare('SELECT user.name, jog.distance, jog.duration, jog.date, strftime("%m",jog.date), strftime("%d",jog.date), strftime("%Y",jog.date) FROM jog INNER JOIN user ON user.id = jog.userId INNER JOIN following ON following.targetUserId = user.id WHERE following.sourceUserId = ? ORDER BY jog.date DESC')
var selectJogAll = db.prepare('SELECT * FROM jog')
var selectJogById = db.prepare('SELECT * FROM jog WHERE id = ?')
var selectJogByUserId = db.prepare('SELECT * FROM jog WHERE userId = ?')
var updateJogById = db.prepare('UPDATE jog SET date = ?, duration = ?, distance = ? WHERE id = ?;')

var selectJogByDate = db.prepare('SELECT * FROM jog WHERE duration = ?')

class Jog {
  static insert(date, duration, distance, userId) {
    // run the insert query
    var info = insertJog.run(date, duration, distance, userId)

    // check what the newly inserted row id is
    var jogId = info.lastInsertRowid

    return jogId
  }

  static updateJogById(date, duration, distance, id) {
    // run the insert query
    updateJogById.run(date, duration, distance, id)
  }

  static findById(id) {
    var row = selectJogById.get(id)

    if (row) {
      return new Jog(row)
    } else {
      return null
    }
  }

  static findAll() {
    var allData = selectJogAll.all()
    return allData
  }

  static findAllByUserID(id) {
    var allData = selectJogByUserId.all(id)
    return allData
  }

  static getAllFollowingJogs(id){
    return getAllJogsWithAllUsers.all(id)
  }

  static deleteTimeByID(id){
    var row = deleteJog.run(id)
    if (row) {
      return new Jog(row)
    } else {
      return null
    }
  }

  static findByDate(date) {
    var row = selectJogByDate.get(date)

    if (row) {
      return new Jog(row)
    } else {
      return null
    }
  }

  constructor(databaseRow) {
    this.id = databaseRow.id
    this.duration = databaseRow.duration
    this.date = databaseRow.date
    this.distance = databaseRow.distance
  }
}

module.exports = Jog
