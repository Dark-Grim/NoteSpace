const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const clear = require('clear');
const git = require('simple-git/promise')();

var call = 0;
app.set("view engine", "ejs");
app.use('/public', express.static('public'));

const dbOptions = { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE, poolSize: 10 };
mongoose.connect(require("./mongo"), dbOptions).then(
    () => { console.log(">  Connection Established"); },
    e => { console.log(">  Connection Failed \n>  " + e); }
);

app.use(bodyparser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var Token = mongoose.model("token", new mongoose.Schema({
    token: String,
    value: String
}));

app.get("/git", function(req, res) {
    var m = req.query.m;
    console.log("\n" + ++call + ") Pushing to Github");
    git.add('.')
        .then(
            (addSuccess) => {
                console.log(">  Changes Successfully Added to Stack");
            }, (failedAdd) => {
                console.log(">  Changes Adding Failed\n>  " + failedAdd);
            });
    git.commit(m)
        .then(
            (successCommit) => {
                console.log(">  Changes Successfully Commited\n   >  Message : \"" + m + "\"");
            }, (failed) => {
                console.log(">  Changes Commit Failed\n>  " + failed);
            });
    git.push('origin', 'master')
        .then((success) => {
            console.log(">  Changes Successfully Pushed to Origin Master");
        }, (failed) => {
            console.log(">  Changes Push Failed\n>  " + failed);
        });
    res.send("1");
});

app.post("/save", function(req, res) {
    var path = req.body.path;
    var value = req.body.value;
    console.log(path + " - " + value);
    /*if (value != null && value.length == 0) {

    }
    else
        Token.find({ token: path }, function(e, token) {
            if (e) { console.log(">  Error occured :\n>  " + e); }
            else {
                if (token.length) {
                    Token.updateMany({ path: path }, {
                            $set: {
                                value: value
                            }
                        },
                        function(err, user) {
                            if (err) {
                                console.log(">  Error While Saving Changes");
                                res.send("0");
                            }
                            else {
                                res.send("1");
                            }
                        });
                }
                else {
                    Token.create({
                        token: path,
                        value: ""
                    }, function(e, user) {
                        if (e) {
                            res.send("0");
                            console.log(">  Error While Creating New Notespace\n>  " + e);
                        }
                        else {
                            res.render("edit", {
                                token: path,
                                value: ""
                            });
                        }
                    });
                }
            }
        });*/
});
app.get("/*", function(req, res) {
    var path = (req.originalUrl).substring(1, (req.originalUrl).length);
    if (path.length == 0) {
        res.render("edit", { value: "Empty" });
    }
    else
        Token.find({ token: path }, function(e, token) {
            if (e) { console.log(">  Error occured :\n>  " + e); }
            else {
                if (token.length) {
                    res.render("edit", {
                        token: path,
                        value: token[0].value

                    });
                }
                else {
                    res.render("edit", {
                        token: path,
                        value: ""
                    });
                }
            }
        });
});

app.listen(process.env.PORT, process.env.IP, function() {
    clear();
    console.log("\n" + ++call + ") Starting Server");
    console.log(">  Server is Listening");
    console.log("\n" + ++call + ") Connection to MongoDB Atlas Server");
});
