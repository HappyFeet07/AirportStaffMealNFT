import sharp from 'sharp';
import fs from 'fs';

function retrievePhoto(targetDir) {
  return fs.readdirSync(targetDir, (err, files) => {
    if (err) {
      return err
    } else {
      return files
    }})
}

function transformSingleImage(image, targetDir) {
  let len = image.length;
  let newName = image.substring(6,  len - 4) +'_T.jpg';
  sharp(image).resize({ width: 700}).toFile(targetDir + '/' + newName)
      .then(() => { console.log(image.toString() + " transformation success")})
      .catch((err) => { console.log(err) })
  return newName;
}

function resizeImage(imagelist, targetDir) {
  for(let i = 0; i < imagelist.length; i++) {
    transformSingleImage('image/'+imagelist[i], targetDir)
  }
}

export default {
  retrievePhoto
};