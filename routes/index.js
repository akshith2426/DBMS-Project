const express = require('express');
const router = express.Router();

router.get('/', (req, resp) => {
	var message = '';
	var userId = null;
	resp.render('index',{message:message,userId:userId})
})

module.exports = router;