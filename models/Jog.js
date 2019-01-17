var db = require('../database')

// get the queries ready - note the ? placeholders
var deleteJog = db.prepare(
  'DELETE FROM jog WHERE ID = ?'
)

var insertJog = db.prepare(
  'INSERT INTO jog (date, duration, distance) VALUES (?, ?, ?)'
)

console.log(db)
console.log(db.table)
var selectJogAll = db.prepare('SELECT * FROM jog')
var selectJogById = db.prepare('SELECT * FROM jog WHERE id = ?')
var updateJogById = db.prepare('UPDATE jog SET date = ?, duration = ?, distance = ? WHERE id = ?;')

var selectJogByDate = db.prepare('SELECT * FROM jog WHERE duration = ?')

class Jog {
  static insert(date, duration, distance) {
    // run the insert query
    var info = insertJog.run(date, duration, distance)

    console.log(info)
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
