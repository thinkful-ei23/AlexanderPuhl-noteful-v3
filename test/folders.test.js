'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHTTP);

describe('Folder Tests', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(function () {
    return Promise.all([
      Folder.insertMany(seedFolders),
      Folder.createIndexes()
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
  describe('GET /api/folders', function() {

    it('should return a list sorted by name with the correct number of folders', function() {
      return Promise.all([
        Folder.find().sort('name'),
        chai.request(app).get('/api/folders')
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
        Folder.find().sort('name'),
        chai.request(app).get('/api/folders')
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
  describe('GET /api/folders/:id', function() {

    it('should return correct folders', function() {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
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
        .get('/api/folders/NOT-A-VALID-ID')
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {
      return chai.request(app)
        .get('/api/folders/DOESNOTEXIST')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });
  // END DESCRIBE GET API/NOTE/ID

  // BEGIN DESCRIBE POST API/NOTES
  describe('POST /api/folders', function() {

    it('should create and return a new item when provided valid data', function() {
      const newItem = {
        'name': 'New Folder',
      };
      let body;
      return chai.request(app)
        .post('/api/folders')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.an('object');
          expect(body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Folder.findById(body.id);
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
      return  chai.request(app).post('/api/folders').send(newNote)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should reuturn an error when given a duplicate name', function() {
      return Folder.findOne()
        .then(data => {
          const newItem = { 'name': data.name };
          return chai.request(app).post('/api/folders').send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('The folder name already exists');
        });
    });
  });
  // END DESCRIBE POST API/NOTES

  // BEGIN DESCRIBE PUT ENDPOINT
  describe('PUT /api/folders/:id', function() {

    it('should update the folder when provided valid data', function() {
      const updateFolder = {
        'name': 'New Folder Name'
      };
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/folders/${data.id}`).send(updateFolder);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateFolder.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      const updateFolder = {
        'name': 'TEST',
      };
      return chai.request(app)
        .put('/api/folders/NOT-A-VALID-ID')
        .send(updateFolder)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      const updateFolder = {
        'name': 'TEST',
      };
      return chai.request(app)
        .put('/api/folders/DOESNOTEXIST')
        .send(updateFolder)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function() {
      const updateItem = {};
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/folders/${data.id}`).send(updateItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should return an error when given a duplicate name', function() {
      return Folder.find().limit(2)
        .then(result => {
          const [item1, item2] = result;
          item1.name = item2.name;
          return chai.request(app).put(`/api/folders/${item1.id}`).send(item1);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body.message).to.equal('The folder name already exists');
        });
    });

  });
  // END DESCRIBE PUT ENDPOINT

  // BEGIN DESCRIBE DELETE ENDPOINT
  describe('DELETE /api/folders/:id', function() {
    it('should delete an existing document and respond with 204', function() {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Folder.findById( data.id );
        })
        .then(res => {
          expect(res).to.be.null;
        });
    });
  });
  // END DESCRIBE DELETE ENDPOINT
});