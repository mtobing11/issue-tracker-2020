/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      var project = req.params.project;
      var query = req.query 
      // console.log(project)
      // console.log(req.query)
      
      var getItems = Object.keys(query).reduce((obj,k)=>{
        if(query[k] !=='') obj[k] = query[k];
        return obj
      },{})
      
      if(getItems.open === false) getItems.open = false;
      if(getItems.open === true) getItems.open = true;
      if(getItems.hasOwnProperty('_id')) getItems._id = ObjectId(getItems._id);

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.collection(project)
          .find(getItems)
          .toArray((err, docs) => {
            if (err) console.log(err);
            //console.log(docs)
            res.json(docs);
            db.close();
          });
      });
    })

    .post(function(req, res) {
      var project = req.params.project;

      const body = req.body;
      const newEntry = {
        issue_title: body.issue_title,
        issue_text: body.issue_text,
        created_by: body.created_by,
        assigned_to: body.assigned_to || '',
        status_text: body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };
      // console.log(body);
      // console.log(newEntry);
    
      if(body.issue_title == undefined || newEntry.issue_text == undefined || body.created_by == undefined) return res.type('text').send('missing inputs')

      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        db.collection(project).insertOne(newEntry, (err, docs) => {
          if (err) res.json(err);
          //console.log(docs);
          res.json(docs.ops[0]);
          db.close();
        });
      });
    })

    .put(function(req, res) {
      var project = req.params.project;
      var body = req.body;
      //console.log(body);

      var arrayKeyItem = Object.keys(body);
      //console.log(arrayKeyItem);
    
      var newEntry = arrayKeyItem.reduce((obj,k)=>{
        //console.log(obj)
        if(k !== '_id' && body[k] !== ""){
          obj[k] = body[k]
        }
        return obj
      },{})

      if(Object.keys(newEntry).length >0){
        newEntry.updated_on = new Date()
      }
      if(newEntry.open == 'false') newEntry.open = false;
      //console.log(newEntry)
      
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        db.collection(project).updateOne(
          { _id: ObjectId(body._id) },
          { $set: newEntry },
          (err, data) => {
            if (err){
              //console.log(err);
              db.close();
              if(Object.keys(newEntry).length === 0) return res.type('text').send('no update field sent');
            } 
            //console.log(data.result.n)
            if(data.result.n === 0){
              res.type('text').send('successfully updated')
            } else {
              res.type('text').send('successfully updated')
            }
            db.close()
          }
        );
        
      });
      
    })

    .delete(function(req, res) {
      var project = req.params.project;
      var id = req.body._id
      //console.log(id);
      if(id==undefined) return res.type('text').send('_id error')
      
      MongoClient.connect(CONNECTION_STRING, (err,db)=>{
        db.collection(project).findOneAndDelete({_id:ObjectId(id)},(err,data)=>{
          if(err){
            db.close();
            return res.type('text').send('could not delete '+id)
          } else {
            return res.type('text').send("deleted "+ id)
          }
          
        })
      })
    });
};
