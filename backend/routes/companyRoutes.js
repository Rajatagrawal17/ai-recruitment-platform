const express = require("express");
const router = express.Router();

const { getAllCompanies } = require("../controllers/companyController");

/* =========================
   PUBLIC GET COMPANIES
========================= */
router.get("/", getAllCompanies);

module.exports = router;
