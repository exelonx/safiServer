const { Router } = require('express');
const { check } = require('express-validator');
const { generarBackup } = require('../../configs/db-backup');

const router = Router();

router.get('/', async (req, res)=>{
    try {

        await generarBackup()
            .catch(err => console.log('error'));

        res.download(`${__dirname}../../../backups/dump.sql`, 'dump.sql')

    } catch (error) {
        console.log('error')
    }
});

router.post('/subir', async (req, res)=>{
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.backup) {
        return res.status(400).send('No files were uploaded.');
      }

      const { backup } = req.files;
    
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      sampleFile = req.files.sampleFile;
      uploadPath = __dirname + '/somewhere/on/your/server/' + sampleFile.name;
    
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(uploadPath, function(err) {
        if (err)
          return res.status(500).send(err);
    
        res.send('File uploaded!');
      });
})

module.exports = router