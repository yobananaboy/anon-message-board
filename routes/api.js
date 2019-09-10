/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const asyncHandler = require('express-async-handler');

var BoardHandler = require('../controllers/BoardHandler.js');

const CONNECTION_STRING = process.env.DB; 

module.exports = (app) => {
  
  var boardHandler = new BoardHandler();
  
  app.route('/api/threads/:board')
    .post(asyncHandler(async(req, res) => {
      let board = req.params.board;
      let id = new ObjectId();
      let post = {
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: [],
        replycount: 0
      };
      const client = await MongoClient.connect(CONNECTION_STRING);
      const db = client.db(process.env.DB_NAME);
      
      let result = await boardHandler.postThread(post, id, board, db);
      if(result.ok) {
        res.redirect('/b/'+board+'/');
      } else {
        res.send('Could not post. Please try again.');
      }
    }))
    .get(asyncHandler(async(req, res) => {
      let board = req.params.board;
    
      const client = await MongoClient.connect(CONNECTION_STRING);
      const db = client.db(process.env.DB_NAME);
    
      let result = await boardHandler.getThreads(board, db);
      res.send(result);
    }))
    .delete(asyncHandler(async(req, res) => {
      let board = req.params.board;
    
      let thread_id = new ObjectId(req.body.thread_id);
      let delete_password = req.body.delete_password;
    
      const client = await MongoClient.connect(CONNECTION_STRING);
      const db = client.db(process.env.DB_NAME);
      let result = await boardHandler.deleteThread(board, thread_id, delete_password, db);
      
      res.send(result);
    }))
    .put(asyncHandler(async(req, res) => {
      let board = req.params.board;
      let thread_id = new ObjectId(req.body.thread_id);
      const client = await MongoClient.connect(CONNECTION_STRING);
      const db = client.db(process.env.DB_NAME);
    
      let result = await boardHandler.report(board, thread_id, false, db);
      res.send(result);
    }));
  
    app.route('/api/replies/:board')
    .get(asyncHandler(async(req, res) => {
        let board = req.params.board;
        let thread_id = new ObjectId(req.query.thread_id);

        const client = await MongoClient.connect(CONNECTION_STRING);
        const db = client.db(process.env.DB_NAME);

        let result = await boardHandler.getReplies(board, thread_id, db);
        res.send(result);
      }))
      .delete(asyncHandler(async(req, res) => {
        let board = req.params.board;
        let thread_id = new ObjectId(req.body.thread_id);
        let reply_id = req.body.reply_id;
        let delete_password = req.body.delete_password;

        const client = await MongoClient.connect(CONNECTION_STRING);
        const db = client.db(process.env.DB_NAME);

        let result = await boardHandler.deletePost(board, thread_id, reply_id, delete_password, db);
        res.send(result);
      }))
      .put(asyncHandler(async(req, res) => {
        let board = req.params.board;
        let thread_id = new ObjectId(req.body.thread_id);
        let reply_id = req.body.reply_id;
      
        const client = await MongoClient.connect(CONNECTION_STRING);
        const db = client.db(process.env.DB_NAME);
      
        let result = await boardHandler.report(board, thread_id, reply_id, db);  
        res.send(result);
      }));
  
    app.route('/api/replies/:board/:thread_id')
        .post(asyncHandler(async(req, res) => {
          let board = req.params.board;
          let thread_id = new ObjectId(req.params.thread_id);
          let reply = {
            _id: new ObjectId(),
            text: req.body.text,
            created_on: new Date(),
            reported: false,
            delete_password: req.body.delete_password
          };

          const client = await MongoClient.connect(CONNECTION_STRING);
          const db = client.db(process.env.DB_NAME);

          let result = await boardHandler.postReply(reply, thread_id, board, db);
          res.redirect('/b/'+board+'/'+req.body.thread_id);
        }));
};
