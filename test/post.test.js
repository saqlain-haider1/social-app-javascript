const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { server } = require('../app');
const { mongoose } = require('mongoose');
const { dummyUser, invalidId, dummyPost } = require('../test-data/test.data');
const User = require('../models/User');
const Post = require('../models/Post');
chai.use(chaiHttp);

const createTestUser = async (user) => {
  const res = await chai.request(server).post('/user/signup').send({
    userData: user,
  });
  return res;
};
describe('Testing Post Routes', () => {
  describe('Test Create Post', () => {
    let userId;
    let token;
    before(async () => {
      //Delete Existing Users and Posts
      await User.deleteMany({});
      await Post.deleteMany({});

      //Register a new user
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      //Login that user and get the token
      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });

    it('should create a new post, return (200 OK)', async () => {
      const res = await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId, postData: dummyPost });
      expect(res.body.message).to.equal('Post created successfully!');
      expect(res.status).to.equal(200);
    });

    it('should not create a post by non-existing user', async () => {
      const res = await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: invalidId, postData: dummyPost });
      expect(res.body.message).to.equal('User not found!');
      expect(res.status).to.equal(404);
    });

    it('should not create a post when invalid data passed', async () => {
      const res = await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId });
      expect(res.status).to.equal(404);
    });
  });

  describe('Testing Get Post', () => {
    let userId;
    let token;
    before(async () => {
      //Delete Existing Users
      await User.deleteMany({});

      //Register a new user
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      //Login that user and get the token
      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;

      // Create posts for this new user
      await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId, postData: dummyPost });
      await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId, postData: dummyPost });
    });

    it('should get posts with valid user Id', async () => {
      const res = await chai
        .request(server)
        .get(`/post/${userId}`)
        .set('authorization', token);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('posts');
    });

    it('should not get posts with invalid user Id', async () => {
      const res = await chai
        .request(server)
        .get(`/post/${invalidId}`)
        .set('authorization', token);
      //console.log('Response: ', res);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found');
    });
  });

  describe('Testing Update Post', () => {
    let userId;
    let token;
    let postId;
    before(async () => {
      //Delete Existing Users
      await User.deleteMany({});

      //Register a new user
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      //Login that user and get the token
      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;

      // Create a post for this new user and save its id
      const postResponse = await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId, postData: dummyPost });

      // Store Id of this post
      postId = postResponse.body.CreatedPost._id;
    });

    it('should update the post with valid Id', async () => {
      const res = await chai
        .request(server)
        .put(`/post/update/${postId}`)
        .set('authorization', token)
        .send({ postData: dummyPost });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Post updated successfully!');
    });

    it('should not update the post with invalid Id', async () => {
      const res = await chai
        .request(server)
        .put(`/post/update/${invalidId}`)
        .set('authorization', token)
        .send({ postData: dummyPost });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Post not found!');
    });

    it('should not update the post when data not given', async () => {
      const res = await chai
        .request(server)
        .put(`/post/update/${invalidId}`)
        .set('authorization', token);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('PostID or Post Data not found!');
    });
  });

  describe('Testing Delete Post', () => {
    let userId;
    let token;
    let postId;
    before(async () => {
      //Delete Existing Users
      await User.deleteMany({});

      //Register a new user
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      //Login that user and get the token
      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;

      // Create a post for this new user and save its id
      const postResponse = await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId, postData: dummyPost });

      // Store Id of this post
      postId = postResponse.body.CreatedPost._id;
    });

    it('should delete the post with valid Id', async () => {
      const res = await chai
        .request(server)
        .delete(`/post/${postId}`)
        .set('authorization', token);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Post deleted successfully!');
    });

    it('should not delete the post with invalid Id', async () => {
      const res = await chai
        .request(server)
        .delete(`/post/${invalidId}`)
        .set('authorization', token);
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Post not found!');
    });
  });

  after(async () => {
    Post.deleteMany({}, () => {
      console.log('Post Collection Erased');
    });
  });
});
