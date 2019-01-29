var db = require('../database')

var getFollowersJogsByDistance = db.prepare(
    'SELECT user.name, userMetadata.totalDistance, userMetadata.totalDuration, userMetadata.averageSpeed FROM userMetadata INNER JOIN user ON user.id = userMetadata.userId INNER JOIN following ON following.targetUserId = user.id WHERE following.sourceUserId = ? ORDER BY userMetadata.totalDistance ASC'
)


var getFollowersJogsBySpeed = db.prepare(
    'SELECT user.name, userMetadata.totalDistance, userMetadata.totalDuration, userMetadata.averageSpeed FROM userMetadata INNER JOIN user ON user.id = userMetadata.userId INNER JOIN following ON following.targetUserId = user.id WHERE following.sourceUserId = ? ORDER BY userMetadata.averageSpeed ASC'
)


var getFollowersJogsByTime = db.prepare(
    'SELECT user.name, userMetadata.totalDistance, userMetadata.totalDuration, userMetadata.averageSpeed FROM userMetadata INNER JOIN user ON user.id = userMetadata.userId INNER JOIN following ON following.targetUserId = user.id WHERE following.sourceUserId = ? ORDER BY userMetadata.totalDuration ASC'
    )


var updateUserMetadata = db.prepare(
    'UPDATE userMetadata SET totalDistance = ?, totalDuration = ?, averageSpeed = ? WHERE userId = ?'
    )

var addUserMetadata = db.prepare(
    'INSERT INTO userMetadata (userId, totalDistance, totalDuration, averageSpeed) VALUES (?, ?, ?, ?)'
  )

var checkIfUserExistsInTable = db.prepare(
'SELECT EXISTS (SELECT 1 FROM userMetadata WHERE userId = ?)'
)

class UserMetadata {

    static modifyUserMetadata(userID, totalDistance, totalDuration, averageSpeed) {
        console.log(checkIfUserExistsInTable.get(userID)['EXISTS (SELECT 1 FROM userMetadata WHERE userId = ?)'] == 1)
        if(checkIfUserExistsInTable.get(userID)['EXISTS (SELECT 1 FROM userMetadata WHERE userId = ?)'] == 1){
            updateUserMetadata.run(totalDistance, totalDuration, averageSpeed, userID)
            console.log("Modified User")
        }else{
            addUserMetadata.run(userID, totalDistance, totalDuration, averageSpeed)
            console.log("Added user")
        }
    }

}

module.exports = UserMetadata