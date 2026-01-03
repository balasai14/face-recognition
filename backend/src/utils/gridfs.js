const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const stream = require('stream');

let bucket;

const initGridFS = () => {
  const db = mongoose.connection.db;
  bucket = new GridFSBucket(db, {
    bucketName: 'images'
  });
  return bucket;
};

const uploadToGridFS = (buffer, filename, metadata = {}) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      bucket = initGridFS();
    }

    const readableStream = new stream.Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(filename, {
      metadata
    });

    readableStream.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id);
      });
  });
};

const downloadFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      bucket = initGridFS();
    }

    const chunks = [];
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    downloadStream
      .on('data', (chunk) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(Buffer.concat(chunks));
      });
  });
};

const deleteFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    if (!bucket) {
      bucket = initGridFS();
    }

    bucket.delete(new mongoose.Types.ObjectId(fileId), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  initGridFS,
  uploadToGridFS,
  downloadFromGridFS,
  deleteFromGridFS
};
