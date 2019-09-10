/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

const ObjectId = require('mongodb').ObjectID;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  var thread_id;
  var second_thread_id;
  var reply_id;
  var board = 'functional-test'
  var text = 'test';
  var delete_password = 'delete';
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Post thread on message board', done => {
        chai.request(server)
          .post('/api/threads/' + board)
          .send({
            text,
            delete_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200); // status of 200 - this redirects to new page
          
            done();
        });
      });
      
      test('Post another thread on message board', done => {
        chai.request(server)
          .post('/api/threads/' + board)
          .send({
            text,
            delete_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
          
            done();
        });
      })
    });
    
    suite('GET', function() {
      test('Get posts from a message board', done => {
        chai.request(server)
          .get('/api/threads/' + board)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body.length, 2);
            assert.property(res.body[0], '_id', 'id');
            assert.property(res.body[0], 'text', 'text');
            assert.property(res.body[0], 'created_on', 'created on');
            assert.property(res.body[0], 'bumped_on', 'bumped on');
            assert.property(res.body[0], 'replies', 'replies');
          
            assert.isArray(res.body[0].replies, 'replies is array');
            assert.equal(res.body[0].text, text, 'text');
          
            thread_id = res.body[0]._id;
            second_thread_id = res.body[1]._id;
          
            done();
        });
      });
    });
    
    suite('PUT', function() {
      test('Report a thread on a message board', done => {
        chai.request(server)
          .put('/api/threads/' + board)
          .send({thread_id})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');

            done();        
        });
      });
    });
      
    suite('DELETE', function() {
      test('Delete a thread on a messageboard with incorrect password', done => {
        chai.request(server)
          .delete('/api/threads/' + board)
          .send({
            thread_id,
            delete_password: 'incorrect password'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');

            done();
        });
      });
      
      test('Delete a thread on a messageboard with correct password', done => {
        chai.request(server)
          .delete('/api/threads/' + board)
          .send({
            thread_id,
            delete_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          
            done();
        });
      });
      
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {    
    suite('POST', function() {
      test('Post a reply to a thread', done => {
        chai.request(server)
          .post('/api/replies/' + board + '/' + second_thread_id)
          .send({
            thread_id: second_thread_id,
            text,
            delete_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
          
            done();
        });
      })
    });
    
    suite('GET', function() {
      test('Get an entire thread with all its replies', done => {
        chai.request(server)
          .get('/api/replies/' + board + '?thread_id=' + second_thread_id)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'replies');

            assert.isArray(res.body.replies);
            assert.equal(res.body.replies[0].text, text);
          
            reply_id = res.body.replies[0]._id;
          
            done();
        });
      })
    });
    
    suite('PUT', function() {
      test('Report a reply to a thread', done => {
        chai.request(server)
          .put('/api/replies/' + board)
          .send({
            thread_id: second_thread_id,
            reply_id
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          
            done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('Delete a reply to a thread with incorrect passwrod', done => {
        chai.request(server)
          .delete('/api/replies/' + board)
          .send({
            thread_id: second_thread_id,
            reply_id,
            delete_password: 'incorrect password'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
          
            done();
        });
      });
      
      test('Delete a reply to a thread with correct password', done => {
        chai.request(server)
          .delete('/api/replies/' + board)
          .send({
            thread_id: second_thread_id,
            reply_id,
            delete_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          
            done();
        });
      });
      
      test('Delete second thread', done => {
        chai.request(server)
          .delete('/api/threads/' + board)
          .send({
            thread_id: second_thread_id,
            delete_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          
            done();
        });
      });
      
    });
    
  });

});