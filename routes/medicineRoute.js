const express = require("express");
const { body, validationResult } = require("express-validator");

const medicineRouter = express.Router();

const Medicine = require("../models/medicineModel");

const categories = [
  { value: "Analgesics", name: "Analgesics" },
  { value: "Antacids", name: "Antacids" },
  { value: "Anti-inflammatory", name: "Anti-inflammatory" },
  { value: "Antibiotics", name: "Antibiotics" },
  { value: "Anticoagulants", name: "Anticoagulants" },
  { value: "Antidepressants", name: "Antidepressants" },
  { value: "Antifungals", name: "Antifungals" },
  { value: "Antihistamines", name: "Antihistamines" },
  { value: "Antimigraine", name: "Antimigraine" },
  { value: "Antiemetics", name: "Antiemetics" },
  { value: "Antipsychotics", name: "Antipsychotics" },
  { value: "Antipyretics", name: "Antipyretics" },
  { value: "Antiseptics", name: "Antiseptics" },
  { value: "Antivirals", name: "Antivirals" },
  { value: "Benzodiazepines", name: "Benzodiazepines" },
  { value: "Beta-blockers", name: "Beta-blockers" },
  { value: "Bile-acid-sequestrants", name: "Bile Acid Sequestrants" },
  { value: "Bisphosphonates", name: "Bisphosphonates" },
  {
    value: "Bradykinin-receptor-antagonists",
    name: "Bradykinin Receptor Antagonists",
  },
  { value: "Bromides", name: "Bromides" },
  { value: "Bronchodilators", name: "Bronchodilators" },
  { value: "Contraceptives", name: "Contraceptives" },
  { value: "Dermatologicals", name: "Dermatologicals" },
  { value: "Diuretics", name: "Diuretics" },
  { value: "Hematopoietic-agents", name: "Hematopoietic Agents" },
  { value: "Herbal", name: "Herbal" },
  { value: "Homeopathic", name: "Homeopathic" },
  { value: "Hypnotics", name: "Hypnotics" },
  { value: "Immunomodulators", name: "Immunomodulators" },
  { value: "Laxatives", name: "Laxatives" },
  { value: "Lithium-salts", name: "Lithium Salts" },
  { value: "Minerals", name: "Minerals" },
  { value: "Nootropics", name: "Nootropics" },
  { value: "Opioids", name: "Opioids" },
  { value: "Probiotics", name: "Probiotics" },
  { value: "Psychostimulants", name: "Psychostimulants" },
  { value: "Skeletal-muscle-relaxants", name: "Skeletal Muscle Relaxants" },
  { value: "Supplements", name: "Supplements" },
  { value: "Thyroid-hormones", name: "Thyroid Hormones" },
  { value: "Urologicals", name: "Urologicals" },
  { value: "Vasodilators", name: "Vasodilators" },
  { value: "Vitamins", name: "Vitamins" },
];

medicineRouter.get("/", async (req, res) => {
  try {
    const allMedicines = await Medicine.find({}).sort({ createdAt: -1 });

    res.render("medicine", { allMedicines });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while rendering the medicine");
  }
});

medicineRouter.get("/add-medicine", async (req, res) => {
  try {
    res.render("addMedicine", { errors: "", values: "", categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while rendering add medicine");
  }
});

medicineRouter.post(
  "/add-medicine",
  [
    body("medicineName")
      .trim()
      .notEmpty()
      .withMessage("Medicine name is required"),
    body("price")
      .trim()
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price should be a number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("status").notEmpty().withMessage("Please select a status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("addMedicine", {
        errors: errors.mapped(),
        values: req.body,
        categories,
      });
    } else {
      const { medicineName, price, category, status } = req.body;

      try {
        const medicineFound = await Medicine.findOne({
          medicineName: { $regex: new RegExp("^" + medicineName + "$", "i") },
        });

        if (medicineFound) {
          return res.render("addMedicine", {
            errors: {
              medicineName: {
                msg: "Medicine already exists, Please update",
              },
            },
            values: req.body,
          });
        }

        const medicine = await Medicine.create({
          medicineName,
          price,
          category,
          status,
        });

        await medicine.save();
        res.redirect("/medicine");
      } catch (err) {
        console.error(err);
        res.status(500).json("Error while adding the medicine!");
      }
    }
  }
);

medicineRouter.get("/search-medicine", async (req, res) => {
  try {
    const searchTerm = req.query.q;

    const searchResults = await Medicine.find({
      $or: [
        { medicineName: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
        { status: { $regex: searchTerm, $options: "i" } },
      ],
    });

    res.render("searchMedicine", { allMedicines: searchResults });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while searching the medicine!");
  }
});

medicineRouter.get("/edit-medicine/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    res.render("editMedicine", {
      medicine,
      errors: "",
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while rendering add medicine");
  }
});

medicineRouter.post(
  "/edit-medicine/:id",
  [
    body("medicineName")
      .trim()
      .notEmpty()
      .withMessage("Medicine name is requires"),
    body("price")
      .trim()
      .notEmpty()
      .withMessage("Price is requires")
      .isNumeric()
      .withMessage("Price should be a number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("status").notEmpty().withMessage("Please select a status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("editMedicine", {
        errors: errors.mapped(),
        values: req.body,
        categories,
      });
    } else {
      const { medicineName, price, category, status } = req.body;

      try {
        const medicineFound = await Medicine.findById(req.params.id);

        if (!medicineFound) {
          console.log(`No medicine found`);
          return res.redirect("/medicine");
        }

        await Medicine.findByIdAndUpdate(
          req.params.id,
          {
            medicineName,
            price,
            category,
            status,
          },
          { new: true }
        );

        res.redirect("/medicine");
      } catch (err) {
        console.error(err);
        res.status(500).send("Error while adding the medicine!");
      }
    }
  }
);

medicineRouter.post("/delete-medicine/:id", async (req, res) => {
  try {
    const medicineFound = await Medicine.findById(req.params.id);

    if (!medicineFound) {
      console.log(`No medicine found`);
      return res.redirect("/medicine");
    }

    await Medicine.findByIdAndDelete(req.params.id);

    res.redirect("/medicine");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while deleting the medicine!");
  }
});

module.exports = medicineRouter;
