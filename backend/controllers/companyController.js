const Company = require("../models/Company");

/* =========================
   GET ALL COMPANIES (PUBLIC)
========================= */
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
