const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.json({ message: 'Posts loaded' });
});

module.exports = router;