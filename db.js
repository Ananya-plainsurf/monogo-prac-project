// connection related details
const { MongoClient } = require("mongodb"); // allow us to connect to database

let dbConnection; // store the connection to the database
module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect("mongodb://localhost:27017/bookstore")
      .then((client) => {
        dbConnection = client.db();
        return cb();
        /* when we call the connectToDb from different file 
        we pass an function as an argument so that it returns 
        the control to the caller if there is error  */
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  }, // initial connect to data base
  getDb: () => dbConnection, // return the data base connection after we finally connect to it.
};
