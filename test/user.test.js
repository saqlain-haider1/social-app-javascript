const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { server } = require('../app');
const { mongoose } = require('mongoose');
const { dummyUser, invalidId, dummyUser2 } = require('../test-data/test.data');
const User = require('../models/User');

chai.use(chaiHttp);
const createTestUser = async (user) => {
  const res = await chai.request(server).post('/user/signup').send({
    userData: user,
  });
  return res;
};
describe('Testing User Routes', () => {
  // it('Default Route', async () => {
  //   const result = await chai.request(server).get('/user/test').send({});
  //   console.log(result.body);
  // });

  describe('Testing User Signup', () => {
    before(async () => {
      await User.deleteMany({});
    });
    it('Create User with with valid credentials', async () => {
      const res = await createTestUser(dummyUser);
      const { body } = res;
      expect(res.status).to.be.eql(200);
      expect(body.message).to.be.eql('User created successfully!');
    });

    it('Dont Created User with invalid credentials', async () => {
      const res = await chai.request(server).post('/user/signup').send({});
      const { body } = res;
      expect(res.status).to.be.eql(400);
      expect(body).to.be.eql({
        error: 'Invalid user data!',
      });
    });

    it('Dont Create User with Email already in use', async () => {
      const res = await createTestUser(dummyUser);
      const { body } = res;
      expect(res.status).to.be.eql(409);
      expect(body).to.be.eql({ message: 'Email already in use' });
    });
  });

  describe('Testing User Login', () => {
    it('Login User with valid credentials', async () => {
      const res = await chai.request(server).post('/user/login').send({
        email: 'saqlainhaider@gmail.com',
        password: 'test1234',
      });
      authToken = res.body.token;
      expect(res.body).to.have.property('token');
      expect(res.body.message).to.be.equals('Auth Succeded!');
    });

    it('Dont Login User with invalid credentials', async () => {
      const res = await chai.request(server).post('/user/login').send({
        email: 'saqlainhaider@gmail.com',
        password: 'wrongPassword',
      });
      expect(res.status).to.be.equals(400);
      expect(res.body.message).to.be.equals('Auth Failed!');
    });

    it('Dont Login User with invalid email or password', async () => {
      const res = await chai.request(server).post('/user/login').send({
        email: 'saqlainhaider123@gmail.com',
        password: 'wrongPassword',
      });
      expect(res.status).to.be.equals(400);
      expect(res.body.error).to.be.equals('Email or Password is incorrect !');
    });
  });

  describe('Testing Get User', () => {
    let userId;
    let token;

    // Create a new user and login with the email and password
    before(async () => {
      await User.deleteMany({});
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });

    // Valid
    it('Get user with valid id should return 200', async () => {
      const res = await chai
        .request(server)
        .get(`/user/${userId}`)
        .set('authorization', token);
      expect(res.status).to.equals(200);
      expect(res.body.message).to.be.equals('User found');
    });

    // Invalid
    it('Get user with invalid id should return 400', async () => {
      const res = await chai
        .request(server)
        .get(`/user/${invalidId}`)
        .set('authorization', token);
      expect(res.status).to.equals(400);
      expect(res.body.error).to.be.equals('User not found!');
    });
  });

  describe('Testing Update User', () => {
    let userId;
    let token;
    before(async () => {
      await User.deleteMany({});
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });

    it('Update user with valid input should return 200', async () => {
      let updateDetails = {
        firstName: 'Saqlain',
        lastName: 'Tintash',
        email: 'saqlainhaider@tintash.com',
        password: 'test1234',
      };
      let updatedUser = await chai
        .request(server)
        .put(`/user/${userId}`)
        .set('authorization', token)
        .send({ userData: updateDetails });
      expect(updatedUser.status).to.equal(200);
      expect(updatedUser.body.message).to.equal('User updated successfully!');
    });

    it('Update user with invalid user ID should return 400', async () => {
      let updateDetails = {
        firstName: 'Saqlain',
        lastName: 'Tintash',
        email: 'saqlainhaider@tintash.com',
        password: 'test1234',
      };
      let updatedUser = await chai
        .request(server)
        .put(`/user/${invalidId}`)
        .set('authorization', token)
        .send({ userData: updateDetails });
      expect(updatedUser.status).to.equal(400);
      expect(updatedUser.body.error).to.equal('User not found!');
    });

    it('Update user with invalid user data should return 400', async () => {
      let updateDetails = {
        firstName: 'Saqlain',
        lastName: 'Tintash',
        email: 'saqlainhaider@tintash.com',
        password: 'test1234',
      };
      let updatedUser = await chai
        .request(server)
        .put(`/user/${invalidId}`)
        .set('authorization', token)
        .send({ userData: updateDetails });
      expect(updatedUser.status).to.equal(400);
      expect(updatedUser.body.error).to.equal('User not found!');
    });
  });

  describe('Testing Delete User Account', () => {
    let userId;
    let token;

    before(async () => {
      await User.deleteMany({});
      let result = await createTestUser(dummyUser);
      const { createdUser } = result.body;
      userId = createdUser._id;

      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });

    it('Delete the user account with valid ID return 200', async () => {
      const res = await chai
        .request(server)
        .delete(`/user/${userId}`)
        .set('authorization', token);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User deleted successfully!');
    });

    it('Delete the user account with invalid ID return 400', async () => {
      const res = await chai
        .request(server)
        .delete(`/user/${invalidId}`)
        .set('authorization', token);
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('User not found!');
    });
  });

  describe('Testing Follow User', () => {
    let token;
    let followUser;
    let userToFollow;
    before(async () => {
      await User.deleteMany({});
      // Register User 1
      let result = await createTestUser(dummyUser);
      followUser = result.body.createdUser;
      // Register User 2
      result = await createTestUser(dummyUser2);
      userToFollow = result.body.createdUser;
      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
    });

    it('Follow User and return success (200 OK)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/follow/${userToFollow._id}`)
        .set('authorization', token)
        .send({ userData: { id: followUser._id } });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User followed successfully!');
    });

    it('Should return User Already Followed and return (200 OK)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/follow/${userToFollow._id}`)
        .set('authorization', token)
        .send({ userData: { id: followUser._id } });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User is already followed!');
    });

    it('Follow user without providing both IDs (400 Not Found)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/follow/${userToFollow._id}`)
        .set('authorization', token)
        .send({ userData: {} });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('User1 or User2  ID not found!');
    });

    it('Follow User with Invalid User 1 ID should return (400 Not Found)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/follow/${userToFollow._id}`)
        .set('authorization', token)
        .send({ userData: { id: invalidId } });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Following User not exists!');
    });

    it('Follow User with Invalid User 2 ID should return (400 Not Found)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/follow/${invalidId}`)
        .set('authorization', token)
        .send({ userData: { id: followUser._id } });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('User to follow not exists!');
    });
  });

  describe('Testing Unfollow User', () => {
    let token;
    let followUser;
    let userToUnFollow;
    before(async () => {
      await User.deleteMany({});
      //Register User 1
      let result = await createTestUser(dummyUser);
      followUser = result.body.createdUser;
      //Register User 2
      result = await createTestUser(dummyUser2);
      userToUnFollow = result.body.createdUser;
      //Login and get token
      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      token = result.body.token;
      //Follow User
      const res = await chai
        .request(server)
        .put(`/user/follow/${userToUnFollow._id}`)
        .set('authorization', token)
        .send({ userData: { id: followUser._id } });
    });

    it('Unfollow User and return success (200 OK)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/unfollow/${userToUnFollow._id}`)
        .set('authorization', token)
        .send({ userData: { id: followUser._id } });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User unfollowed successfully!');
    });

    it('Return user not followed and success (400 Not Found)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/unfollow/${userToUnFollow._id}`)
        .set('authorization', token)
        .send({ userData: { id: followUser._id } });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('User not followed!');
    });

    it('Unfollow user without providing both IDs (400 Not Found)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/unfollow/${userToUnFollow._id}`)
        .set('authorization', token)
        .send({ userData: {} });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('User1 or User2  ID not found!');
    });

    it('Unfollow User with Invalid User 1 ID should return (400 Not Found)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/unfollow/${userToUnFollow._id}`)
        .set('authorization', token)
        .send({ userData: { id: invalidId } });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Following User not exists!');
    });

    it('Follow User with Invalid User 2 ID should return (400 Not Found)', async () => {
      const res = await chai
        .request(server)
        .put(`/user/unfollow/${invalidId}`)
        .set('authorization', token)
        .send({ userData: { id: followUser._id } });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('User to unfollow not exists!');
    });
  });
  describe('Testing User Payment', () => {
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
    });

    it('Payment successfull and return success (200 OK)', async () => {
      const res = await chai
        .request(server)
        .post('/user/payment')
        .set('authorization', token)
        .send({ userId });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Social Feed Payment Successful');
    });

    it('Again try to pay return Already Paid! and success (200 OK)', async () => {
      const res = await chai
        .request(server)
        .post('/user/payment')
        .set('authorization', token)
        .send({ userId });
      expect(res.status).to.equal(200);
      expect(res.body.success).to.equal(true);
      expect(res.body.message).to.equal('User has already paid for the feed!');
    });

    it('Try to pay with invalid userId, return (404 Not Found)', async () => {
      const res = await chai
        .request(server)
        .post('/user/payment')
        .set('authorization', token)
        .send({ userId: invalidId });
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found!');
    });

    it('Try to pay without providing userId, return (404 Not Found)', async () => {
      const res = await chai
        .request(server)
        .post('/user/payment')
        .set('authorization', token)
        .send({ userId: '' });
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('UserID is required');
    });
  });

  describe('Testing Feed', () => {
    let token;
    let user;
    let followedUser;
    before(async () => {
      await User.deleteMany({});
      // Register User 1 with paid = true
      let result = await createTestUser(dummyUser);

      user = result.body.createdUser;
      // Register User 2 whose posts we will get in the feed of above user. With paid = false by default
      result = await createTestUser(dummyUser2);
      followedUser = result.body.createdUser;
      // Login user 1
      result = await chai.request(server).post('/user/login').send({
        email: dummyUser.email,
        password: dummyUser.password,
      });
      // store token
      token = result.body.token;

      // Doing Payment of user 1
      const temp = await chai
        .request(server)
        .post('/user/payment')
        .set('authorization', token)
        .send({ userId: user._id });
      // Follow user 2
      await chai
        .request(server)
        .put(`/user/follow/${followedUser._id}`)
        .set('authorization', token)
        .send({ userData: { id: user._id } });
    });

    it('Try to get feed of non paid user, return (400 Bad Request)', async () => {
      const res = await chai
        .request(server)
        .get(`/user/feed`)
        .set('authorization', token)
        .send({ userId: followedUser._id });
      expect(res.body.error).to.equal(
        'User did not paid for the social feed yet. Please pay first!'
      );
      expect(res.status).to.equal(400);
    });

    it('Get feed of paid user, return (200 OK)', async () => {
      const res = await chai
        .request(server)
        .get(`/user/feed`)
        .set('authorization', token)
        .send({ userId: user._id });
      expect(res.body).to.have.property('posts');
      expect(res.status).to.equal(200);
    });

    it('Get feed of non existing user, return (400 Bad Request)', async () => {
      const res = await chai
        .request(server)
        .get(`/user/feed`)
        .set('authorization', token)
        .send({ userId: invalidId });
      expect(res.body.error).to.equal('User not found');
      expect(res.status).to.equal(400);
    });
  });

  after(async () => {
    User.deleteMany({}, () => {
      console.log('User Collection Erased');
    });
  });
});
