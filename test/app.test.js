const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { mongoose } = require('mongoose');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { server } = require('../app');
chai.use(sinonChai);
chai.use(chaiHttp);

describe('Testing App routes', () => {
  it('Testing app default route', async () => {
    const res = await chai.request(server).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal(
      'Welcome to the Social Network App deployed on Heroku Server'
    );
  });
  it('Testing mongoose connection', async () => {
    const getStub = sinon
      .stub(mongoose, 'connect')
      .resolves({ error: 'Mongoose Connection Error' });

    const res = await mongoose.connect('abc');
    console.log(res);
    expect(res.error).to.equal('Mongoose Connection Error');
  });
});
