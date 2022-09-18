const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { server } = require('../app');
const { mongoose } = require('mongoose');
const { dummyUser, invalidId, dummyPost } = require('../test-data/test.data');
const User = require('../models/User');
const Post = require('../models/Post');
const Moderator = require('../models/Moderator');
chai.use(chaiHttp);

const createTestUser = async (user) => {
  const res = await chai.request(server).post('/moderator/signup').send({
    userData: user,
  });
  return res;
};

describe('Testing Moderator Routes', () => {
  describe('Testing Moderator Signup', () => {
    before(async () => {
      await Moderator.deleteMany({});
    });
    it('Create Moderator with with valid credentials', async () => {
      const res = await createTestUser(dummyUser);
      const { body } = res;
      expect(res.status).to.be.eql(200);
      expect(body.message).to.be.eql('User created successfully!');
    });

    it('Dont Created Moderator with invalid credentials', async () => {
      const res = await chai.request(server).post('/moderator/signup').send({});
      const { body } = res;
      expect(res.status).to.be.eql(400);
      expect(body).to.be.eql({
        error: 'Invalid user data!',
      });
    });

    it('Dont Create Moderator with Email already in use', async () => {
      const res = await createTestUser(dummyUser);
      const { body } = res;
      expect(res.status).to.be.eql(409);
      expect(body).to.be.eql({ message: 'Email already in use' });
    });
  });

  describe('Testing Moderator Login', () => {
    it('Login Moderator with valid credentials', async () => {
      const res = await chai.request(server).post('/moderator/login').send({
        email: 'saqlainhaider@gmail.com',
        password: 'test1234',
      });
      authToken = res.body.token;
      expect(res.body).to.have.property('token');
      expect(res.body.message).to.be.equals('Auth Succeded!');
    });

    it('Dont Login Moderator with invalid credentials', async () => {
      const res = await chai.request(server).post('/moderator/login').send({
        email: 'saqlainhaider@gmail.com',
        password: 'wrongPassword',
      });
      expect(res.status).to.be.equals(400);
      expect(res.body.message).to.be.equals('Auth Failed!');
    });

    it('Dont Login Moderator with invalid email or password', async () => {
      const res = await chai.request(server).post('/moderator/login').send({
        email: 'saqlainhaider123@gmail.com',
        password: 'wrongPassword',
      });
      expect(res.status).to.be.equals(400);
      expect(res.body.error).to.be.equals('Email or Password is incorrect !');
    });
  });

  describe('Testing Get All Posts', () => {
    let userId;
    let token;

    before(async () => {
      await Moderator.deleteMany({});
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      result = await chai.request(server).post('/moderator/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });
    it('Get posts', async () => {
      const res = await chai
        .request(server)
        .get('/moderator/')
        .set('authorization', token);
      expect(res.status).to.be.eql(200);
      expect(res.body).to.have.property('posts');
      expect(res.body).to.have.property('Pagination Details');
    });
  });

  describe('Testing Get Single Post', () => {
    let userId;
    let moderatorId;
    let postId;
    let token;
    before(async () => {
      //Delete Existing Users and Moderators
      await User.deleteMany({});
      await Moderator.deleteMany({});

      //Register a new user
      let result = await chai
        .request(server)
        .post('/user/signup')
        .send({
          userData: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'test1234',
          },
        });
      const { createdUser } = result.body;
      userId = createdUser._id;

      //Login that user and get the token
      result = await chai.request(server).post('/user/login').send({
        email: createdUser.email,
        password: 'test1234',
      });
      token = result.body.token;

      // Create post for this new user and save its id
      let postResponse = await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId, postData: dummyPost });
      postId = postResponse.body.CreatedPost._id;

      //Register a new Moderator
      await Moderator.deleteMany({});
      result = await createTestUser(dummyUser);
      let moderatorResponse = result.body.createdUser;
      moderatorId = moderatorResponse._id;

      // Login the moderator and get the token
      result = await chai.request(server).post('/moderator/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });

    it('should get post with valid post Id', async () => {
      const res = await chai
        .request(server)
        .get(`/moderator/${postId}`)
        .set('authorization', token);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('post');
    });

    it('should not get post with invalid Id', async () => {
      const res = await chai
        .request(server)
        .get(`/moderator/${invalidId}`)
        .set('authorization', token);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Post not found');
    });
  });

  describe('Testing Delete Post', () => {
    let userId;
    let moderatorId;
    let postId;
    let token;
    before(async () => {
      //Delete Existing Users and Moderators
      await User.deleteMany({});
      await Moderator.deleteMany({});

      //Register a new user
      let result = await chai
        .request(server)
        .post('/user/signup')
        .send({
          userData: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'test1234',
          },
        });
      const { createdUser } = result.body;
      userId = createdUser._id;

      //Login that user and get the token
      result = await chai.request(server).post('/user/login').send({
        email: createdUser.email,
        password: 'test1234',
      });
      token = result.body.token;

      // Create post for this new user and save its id
      let postResponse = await chai
        .request(server)
        .post('/post/create')
        .set('authorization', token)
        .send({ userId: userId, postData: dummyPost });
      postId = postResponse.body.CreatedPost._id;

      //Register a new Moderator
      await Moderator.deleteMany({});
      result = await createTestUser(dummyUser);
      let moderatorResponse = result.body.createdUser;
      moderatorId = moderatorResponse._id;

      // Login the moderator and get the token
      result = await chai.request(server).post('/moderator/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });
    it('should delete the post with valid id', async () => {
      const res = await chai
        .request(server)
        .delete(`/moderator/${postId}`)
        .set('authorization', token);
      expect(res.status).to.be.equal(200);
      expect(res.body.message).to.be.equal('Post deleted successfully!');
    });
    it('should not delete the post with invalid id', async () => {
      const res = await chai
        .request(server)
        .delete(`/moderator/${invalidId}`)
        .set('authorization', token);
      expect(res.status).to.be.equal(400);
      expect(res.body.error).to.be.equal('Post not found!');
    });
  });

  after(async () => {
    await User.deleteMany({});
    await Moderator.deleteMany({});
    await Post.deleteMany({});
  });
});
