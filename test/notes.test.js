'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHTTP);
const options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } } };

describe('Node Noteful Tests', function() {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, options)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(seedNotes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  // test cases
  describe('GET endpoint', function() {
    it('should return all existing notes', function() {
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return notes with the right fields', function() {

    });
  });

  describe('POST endpoint', function() {
    it('should add a new note', function() {

    });
  });

  describe('PUT endpoint', function() {
    it('should update fields you send over', function() {

    });
  });

  describe('DELETE endpoint', function() {
    it('should delete a note by id', function() {

    });
  });
});