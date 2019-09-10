function BoardHandler() {
  // post specific thread to a board
  this.postThread = async (post, id, board, db) => {
    let response = await db.collection(board).findOneAndUpdate({ _id: id }, { $set: post }, { upsert: true });
    return response;
  };
  
  // post a reply to a thread
  this.postReply = async (reply, thread_id, board, db) => {
    let response = await db.collection(board).findOneAndUpdate(
      {_id: thread_id},
      {
        $set: {bumped_on: new Date()},
        $push: {replies: reply},
        $inc: { replycount: 1 }
      }
    );
    return response;
  };
  
  // get array of most recent 10 bumped threads with top 3 replies
  this.getThreads = async (board, db) => {
    let response = await db.collection(board).find().toArray();  
    response = response.slice(0, 10)
    response = response.map(thread => {
      thread.replies = thread.replies.slice(0, 3);
      delete thread.delete_password;
      delete thread.reported;
      thread.replies = thread.replies.map(reply => {
        delete reply.delete_password;
        delete reply.reported;
        return reply;
      });
      return thread;
    });
        
    return response;
  };
  
  // get an entire thread with all its replies
  this.getReplies = async (board, thread_id, db) => {
    let response = await db.collection(board).find({ _id: thread_id }).toArray();
    response = response[0];
    delete response.delete_password;
    delete response.reported;
    response.replies = response.replies.map(reply => {
      delete reply.delete_password;
      delete reply.reported;
      return reply;
    });
    
    return response;
  };
  
  // delete a thread completely
  this.deleteThread = async (board, thread_id, delete_password, db) => {
    let response = await db.collection(board).deleteOne({ _id: thread_id, delete_password });
    if(response.deletedCount !== 0) {
      return 'success';
    }
    return 'incorrect password';
  };
  // delete a post
  this.deletePost = async (board, thread_id, reply_id, delete_password, db) => {
    let response = await db.collection(board).find({ _id: thread_id }).toArray();
    if(response[0]) {
      let index = response[0].replies.findIndex(reply => {
        return reply._id == reply_id;
      });
      if(response[0].replies[index].delete_password == delete_password) {
        response[0].replies[index].text = "[deleted]";
        db.collection(board).save(response[0]);
        return 'success';
      }
    }
    return 'incorrect password';
    
  }; 
  
  this.report = async(board, thread_id, reply_id, db) => {
    // report thread
    if(!reply_id) {
      let response = await db.collection(board).findOneAndUpdate(
        {_id: thread_id},
        {$set: {reported: true} },
        {returnOriginal: false }
      );
      if(response.value.reported == true) {
        return 'success';
      } 
    } else {
      // report reply
      let response = await db.collection(board).find({ _id: thread_id }).toArray();
      if(response[0]) {
        let index = response[0].replies.findIndex(reply => {
          return reply._id == reply_id;
        });
        response[0].replies[index].reported = true;
        db.collection(board).save(response[0]);
        return 'success';
      }
    }
    return 'fail';
  };
  
  
  
  
};

module.exports = BoardHandler;