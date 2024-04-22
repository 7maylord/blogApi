const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: String,
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  state: { type: String, enum: ['draft', 'published'], default: 'draft' },
  readCount: { type: Number, default: 0 },
  readingTime: { type: Number, default: 0 },
  tags: [ {type: String} ],
  body: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);
