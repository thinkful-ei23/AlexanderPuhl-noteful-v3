'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tag');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHTTP);

describe('Node Noteful Tag Tests', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(function () {
    return Promise.all([
      Tag.insertMany(seedTags),
      Tag.createIndexes()
    ]); 
  });
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  after(function () {
    return mongoose.disconnect();
  });
  // test cases

  // BEGIN DESCRIBER GET ENDPOINT
  describe('GET /api/tags', function() {

    it('should return a list sorted by name with the correct number of tags', function() {
      return Promise.all([
        Tag.find().sort('name'),
        chai.request(app).get('/api/tags')
      ])
        .then(([data,res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct fields and values', function() {
      return Promise.all([
        Tag.find().sort('name'),
        chai.request(app).get('/api/tags')
      ])
        .then(([data,res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach((item, i) => {
            expect(item).to.be.an('object');
            expect(item).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
            expect(item.id).to.equal(data[i].id);
            expect(item.name).to.equal(data[i].name);
            expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });
  });
  // END DESCRIBE GET ENDPOINT

  // BEGIN DESCRIBE GET API/NOTE/ID
  describe('GET /api/tags/:id', function() {

    it('should return correct folders', function() {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 for an invalid id', function() {
      return chai.request(app)
        .get('/api/tags/NOT-A-VALID-ID')
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {
      return chai.request(app)
        .get('/api/tags/DOESNOTEXIST')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });
  // END DESCRIBE GET API/NOTE/ID

  // BEGIN DESCRIBE POST API/NOTES
  describe('POST /api/tags', function() {

    it('should create and return a new item when provided valid data', function() {
      const newItem = {
        'name': 'New Folder',
      };
      let body;
      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.an('object');
          expect(body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Tag.findById(body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
          expect(new Date(body.createdAt)).to.eql(data.createdAt);
          expect(new Date(body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing "name" field', function() {
      const newNote = {
        'foo': 'bar'
      };
      return  chai.request(app).post('/api/tags').send(newNote)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should reuturn an error when given a duplicate name', function() {
      return Tag.findOne()
        .then(data => {
          const newItem = { 'name': data.name };
          return chai.request(app).post('/api/tags').send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('The tag name already exists');
        });
    });
  });
  // END DESCRIBE POST API/NOTES

  // BEGIN DESCRIBE PUT ENDPOINT
  describe('PUT /api/tags/:id', function() {

    it('should update the tag when provided valid data', function() {
      const updateTag = {
        'name': 'New Tag Name'
      };
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/tags/${data.id}`).send(updateTag);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateTag.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      const updateTag = {
        'name': 'TEST',
      };
      return chai.request(app)
        .put('/api/tags/NOT-A-VALID-ID')
        .send(updateTag)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      const updateTag = {
        'name': 'TEST',
      };
      return chai.request(app)
        .put('/api/tags/DOESNOTEXIST')
        .send(updateTag)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function() {
      const updateTag = {};
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/tags/${data.id}`).send(updateTag);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should return an error when given a duplicate name', function() {
      return Tag.find().limit(2)
        .then(result => {
          const [item1, item2] = result;
          item1.name = item2.name;
          return chai.request(app).put(`/api/tags/${item1.id}`).send(item1);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('The tag name already exists');
        });
    });

  });
  // END DESCRIBE PUT ENDPOINT

  // BEGIN DESCRIBE DELETE ENDPOINT
  describe('DELETE /api/folders/:id', function() {
    it('should delete an existing tag and respond with 204', function() {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Tag.findById( data.id );
        })
        .then(res => {
          expect(res).to.be.null;
        });
    });
  });
  // END DESCRIBE DELETE ENDPOINT
});