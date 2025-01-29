const express = require("express");
const router = express.Router();
const Category = require("../model/categorySchema");

//get all categories
router.get("/fetch", (req, res) => {
  Category.find()
    .then((categories) => {
      res.json({ success: true, data: categories });
    })
    .catch((err) => {
      res.status(401).json({ success: false, err });
      console.log(err);
    });
});

module.exports = router;