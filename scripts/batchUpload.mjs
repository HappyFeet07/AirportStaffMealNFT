import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';
dotenv.config()

const apiKey = process.env.PINATA_API_KEY;
const privateKey = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(apiKey, privateKey);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const absolute = path.resolve(__dirname, '../');

function retrievePhoto(targetDir) {
  return fs.readdirSync(targetDir, (err, files) => {
    if (err) {
      return err
    } else {
      return files
    }})
}

const packAsMetadata = (name, ipfsHash, attributes) => {
  let metadata = {
    name:name,
    image:"ipfs://" + ipfsHash,
    attributes: attributes
  }
  return metadata;
}

const pin_metadata_with_img = async (name, attributes, image) => {
  
  let img = fs.createReadStream(image);
  let retHash;
  await pinata.pinFileToIPFS(img)
          .then((res) => { retHash = res; })
          .catch((err) => { console.log(err); })
  retHash = retHash.IpfsHash;

  return packAsMetadata(name, retHash, attributes);
}

const main = async (absPath) => {

  let path = "./modified/";
  let targetFolder = "./uploadable/";
  const images = retrievePhoto(path);

  for(let i = 1; i <= images.length; i++) {
    const imageIndex = images[i - 1];
    let upload = await pin_metadata_with_img(imageIndex, [], path + imageIndex);
    upload = JSON.stringify(upload);
    fs.writeFileSync(
      targetFolder + i,
      upload
    );
  }

  const option = {
    pinataMetadata: {
      name: "Metadata",
    }
  }

  pinata.pinFromFS(
    absPath +'/uploadable/',
    option
  ).then((res) => {
    console.log(res);
  }).catch((err) => {
    console.log(err);
  });
}

const clearCache = (list) => {
  list.forEach(hash => {
    pinata.unpin(hash).then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });
  });
}

// clearCache([
//   "QmTXGcuZbg996PuqfthXkkfYYhT3YVfJbGdMeA1HJV74Mw",
//   "QmV5ymDSyQHwCUyzkBiJAX6kmNLnymzNxGCA7ngDJhWwHH",
//   "QmZ7bxLvrFzENX5s8jb8ZLku3zHu9DA8YnNz2c9GmPeNWQ",
//   "QmZbwdp3D5d3tjEBnM3Xxn9NDvyZeeHHyx2A2nDJaoALrJ",
//   "QmPsRXwdi7aqn8dW14Vem11Y66W4NCoGciCadW64LFzerG",
//   "QmSTvGwXMeQ3iJYN3ZTNtR5BRYEbT2hvPjAmQ241QR3yvg",
//   "QmPzZUfyBgY4GgPvtYtnaeHrh3Xvqy6eZ6JdqWr54jvEHL",
//   "QmSDWYDUW8MfTiNvkD2ZmPmDPFw6KkpKGc22N1N7DSwAP2",
//   "QmRjuiL6KoKf7175YxVTs3QmTx7eo3EWdeckWjNjWUW9cd",
//   "QmTjieyvwBnWiPw9XyrGzzoTf5q8ue2GTeLaTqV5eUvx68",
//   "QmPL59C79zBGXmYJV3KFUvLgP4PZDLyJAZQRZERSEaVbAc",
//   "QmQjFsaDobez6tiLsjNn7DLtkMbxaRMV2owneGPg4TK7s7",
//   "QmaY8kECKh9khtzzZkkdCWjDge62oi8nfANPqnL62FwFxf",
//   "QmbS5aF71X4tcQNANz4R2uZVan4eKutEpmCiyMftA4wkeJ",
//   "QmSq53rKwvCwnhFnQmU7ZP33nHG6NSvaQywfGKVNULHCgw",
//   "QmU4pjDi4ZxFcRXVPDPwM7jH5B2nrtkd8KVLULHBVjBRwY",
//   "QmZCyhHzurtmmCCCbdiuCKNbUjQXXpgB6bX72Lz7EeVZay",
//   "QmfJKJfqrUk1Ko9GD5gLw5vhbwNtbdrnzLivp3sLQisKBs",
//   "Qmay1qrfY8WzQJkAGBd9hnPHggxpvNjKnKYTQtxqxFwUJc",
//   "QmcryMxqzW2VNE364yBu1qwzn28JC7v7ZTFqtygk9WUaQV"
// ])

main(absolute)