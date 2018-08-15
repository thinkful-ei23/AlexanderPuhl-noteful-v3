'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');
const { PORT, MONGODB_URI } = require('../config');
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  console.log('Get All Notes');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const { searchTerm } = req.query;
      let filter = {};

      if (searchTerm) {
        filter = {$or: [
          {title: { $regex: searchTerm }},
          {content: { $regex: searchTerm }}
        ]};
      }

      return Note.find(filter).sort({ _id: 'asc' });
    })
    .then(results => {
      res.json(results);
      // console.log(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      res.json(`ERROR: ${err.message}`);
      res.json(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  console.log('Get a Note');
  mongoose.connect(MONGODB_URI)
    .then(() => {

      const searchId = req.params.id;
      let filter = {};

      if (searchId) {
        filter._id = { _id: searchId };
      }

      // return Note.findOne({_id : searchId});
      return Note.findOne(filter);
    })
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  console.log('Create a Note');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const { title, content } = req.body;
      let filter = {};
      if (title && content) {
        filter = { title: title, content: content };
      }
      return Note.create(filter);
    })
    .then(results => {
      res.json(results);
      console.log(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;
      const { title, content } = req.body;
      let filter = {};
      if (id && title && content) {
        // filter = `{_id: ${id}, {title: ${title}}`
        filter.id = {_id: id};
        filter.titleAndContent = {title: title, content: content};
      }
      return Note.findByIdAndUpdate(filter.id, filter.titleAndContent);
    })
    .then(results => {
      res.json(results);
      console.log(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const { id } = req.params;

      let filter = {};
      if (id) {
        filter.id = {_id: id};
      }
      return Note.findByIdAndRemove(filter.id);
    })
    .then(results => {
      res.status(204).end();
      console.log(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

module.exports = router;