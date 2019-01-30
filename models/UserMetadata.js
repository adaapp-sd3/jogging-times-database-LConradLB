var db = require('../database')

var getFollowersJogsByDistance = db.prepare(
    'SELECT user.name, userMetadata.totalDistance AS value FROM userMetadata INNER JOIN user ON user.id = userMetadata.userId INNER JOIN following ON following.targetUserId = user.id WHERE following.sourceUserId = ? ORDER BY userMetadata.totalDistance ASC'
)


var getFollowersJogsBySpeed = db.prepare(
    'SELECT user.name, userMetadata.averageSpeed AS value FROM userMetadata INNER JOIN user ON user.id = userMetadata.userId INNER JOIN following ON following.targetUserId = user.id WHERE following.sourceUserId = ? ORDER BY userMetadata.averageSpeed ASC'
)


var getFollowersJogsByTime = db.prepare(
    'SELECT user.name, userMetadata.totalDuration AS value FROM userMetadata INNER JOIN user ON user.id = userMetadata.userId INNER JOIN following ON following.targetUserId = user.id WHERE following.sourceUserId = ? ORDER BY userMetadata.totalDuration ASC'
)


var updateUserMetadata = db.prepare(
    'UPDATE userMetadata SET totalDistance = ?, totalDuration = ?, averageSpeed = ? WHERE userId = ?'
)

var addUserMetadata = db.prepare(
    'INSERT INTO userMetadata (userId, totalDistance, totalDuration, averageSpeed) VALUES (?, ?, ?, ?)'
)

var getUserMetadata = db.prepare(
    'SELECT user.name, userMetadata.totalDuration, userMetadata.averageSpeed, userMetadata.totalDistance FROM userMetadata INNER JOIN user ON user.id = userMetadata.userId WHERE userId = ?'
)

var checkIfUserExistsInTable = db.prepare(
    'SELECT EXISTS (SELECT 1 FROM userMetadata WHERE userId = ?)'
)

class UserMetadata {

    static modifyUserMetadata(userID, totalDistance, totalDuration, averageSpeed) {
        console.log(checkIfUserExistsInTable.get(userID)['EXISTS (SELECT 1 FROM userMetadata WHERE userId = ?)'] == 1)
        if (checkIfUserExistsInTable.get(userID)['EXISTS (SELECT 1 FROM userMetadata WHERE userId = ?)'] == 1) {
            updateUserMetadata.run(totalDistance, totalDuration, averageSpeed, userID)
            console.log("Modified User")
        } else {
            addUserMetadata.run(userID, totalDistance, totalDuration, averageSpeed)
            console.log("Added user")
        }
    }

    static retrieveFollowersJogsByDistance(userID) {
        return getFollowersJogsByDistance.all(userID)
    }

    static retrieveFollowersJogsByTime(userID) {
        return getFollowersJogsByTime.all(userID)
    }

    static retrieveFollowersJogsBySpeed(userID) {
        return getFollowersJogsBySpeed.all(userID)
    }

    static retrieveUserMetadata(userID) {
        return getUserMetadata.get(userID)
    }

}

module.exports = UserMetadata