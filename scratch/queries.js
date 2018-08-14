'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI)
  .then(() => {
    const searchTerm = 'cats';
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
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });


// mongoose.connect(MONGODB_URI)
//   .then(() => {

//     const searchId = '000000000000000000000001';
//     let filter = {};

//     if (searchId) {
//       filter._id = { _id: searchId };
//     }

//     // return Note.findOne({_id : searchId});
//     return Note.findOne(filter);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const title = 'TEST';
//     const content = 'TestTestTestTestTestTestTestTest Puhl';
//     let filter = {};
//     if (title && content) {
//       filter = { title: title, content: content };
//     }
//     return Note.create(filter);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000005';
//     const title = 'TEST';
//     const content = 'TestTestTestTestTestTestTestTest';
//     let filter = {};
//     if (id && title && content) {
//       // filter = `{_id: ${id}, {title: ${title}}`
//       filter.id = {_id: id};
//       filter.titleAndContent = {title: title, content: content};
//     }
//     return Note.findByIdAndUpdate(filter.id, filter.titleAndContent);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '5b7335ab8b3dd035bcfba655';

//     let filter = {};
//     if (id) {
//       filter.id = {_id: id};
//     }
//     return Note.findByIdAndRemove(filter.id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });