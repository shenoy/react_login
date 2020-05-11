const bcrypt = require("bcrypt");

class Router {
  constructor(app, db) {
    this.login(app, db);
    this.logout(app, db);
    this.isLoggedIn(app, db);
    this.signup(app, db);
  }

  login(app, db) {
    app.post("/login", (req, res) => {
      let username = req.body.username;
      let password = req.body.password;
      username = username.toLowerCase();
      if (username.length > 12 || password.length > 12) {
        res.json({
          success: false,
          msg: "An error has occured, please try again",
        });
        return;
      }

      let cols = [username];

      db.query(
        "SELECT * FROM user WHERE username = ? LIMIT 1",
        cols,
        (err, data, fields) => {
          if (err) {
            res.json({
              success: false,
              msg: "An error has occured, please try again",
            });
            return;
          }
          if (data && data.length === 1) {
            console.log(data, "data from login");
            bcrypt.compare(
              password,
              data[0].password,
              (bcryptErr, verified) => {
                if (verified) {
                  req.session.userID = data[0].id;
                  res.json({
                    success: true,
                    username: data[0].username,
                  });
                  return;
                } else {
                  res.json({
                    success: false,
                    msg: "Invalid password",
                  });
                }
              }
            );
          } else {
            res.json({
              success: false,
              msg: "User not found, please try again",
            });
          }
        }
      );
    });
  }

  logout(app, db) {
    app.post("/logout", (req, res) => {
      if (req.session.userID) {
        req.session.destroy();
        res.json({
          success: true,
        });
        return true;
      } else {
        res.json({
          succcess: false,
        });
        return false;
      }
    });
  }

  isLoggedIn(app, db) {
    app.post("/isLoggedIn", (req, res) => {
      if (req.session.userID) {
        let cols = [req.session.userID];
        db.query(
          "SELECT * FROM user WHERE id = ? LIMIT 1",
          cols,
          (err, data, fields) => {
            if (data && data.length === 1) {
              res.json({
                success: true,
                username: data[0].username,
              });
              return true;
            } else {
              res.json({
                success: false,
              });
            }
          }
        );
      } else {
        res.json({
          success: false,
        });
      }
    });
  }
  signup(app, db) {
    app.post("/signup", (req, res) => {
      //========================================================STORES REQUEST BODY INTO VARIABLES=================================//
      let username = req.body.username;
      let password = req.body.password;
      let passwordConfirm = req.body.passwordConfirm;
      username = username.toLowerCase();

      //=====================================================CHECKS PASSWORD LENGTH==========================================//
      if (username.length > 12 || password.length > 12) {
        res.json({
          success: false,
          msg: "Username is longer than 12 characters!",
        });
        return;
      }

      //============================================CHECKS IF PASSWORDS MATCH=================================================//

      if (password !== passwordConfirm) {
        res.json({
          success: false,
          msg: "Passwords do not match. Please try again",
        });
        return;
      }

      //=============================CREATES NEW USER=======================================================================//

      let pwd = bcrypt.hashSync(password, 9);
      var sql = "INSERT INTO user (username, password) VALUES ?";
      var values = [[username, pwd]];

      db.query(sql, [values], function (err, result) {
        if (err) {
          res.json({
            success: false,
            msg: "An error has occured in signup, please try again",
          });
          return;
        }
        console.log("Number of records inserted: " + result.affectedRows);
      });

      //=============================LOOKS UP FOR  SIGNED UP USER AND CREATES A SESSION========================================//

      var sql2 = "SELECT * FROM user WHERE username = ? LIMIT 1";
      let cols = [username];

      db.query(sql2, cols, (err, data, fields) => {
        if (err) {
          res.json({
            success: false,
            msg: "An error has occured in signup, please try again",
          });
          return;
        }
        if (data && data.length === 1) {
          console.log(data, "data from second db query");
          bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {
            if (verified) {
              req.session.userID = data[0].id;
              res.json({
                success: true,
                username: data[0].username,
              });
              return;
            }
          });
        }
      });

      //========================================================================================================================//
    });
  }


}

module.exports = Router;
