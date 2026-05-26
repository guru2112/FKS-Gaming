const Combo = require("../../models/Combo");

exports.getCombos = async (req, res, next) => {
  try {
    const combos = await Combo.find().sort({ createdAt: -1 });
    res.json({ combos });
  } catch (err) {
    next(err);
  }
};

exports.createCombo = async (req, res, next) => {
  try {
    const combo = await Combo.create(req.body);
    res.status(201).json({ combo });
  } catch (err) {
    next(err);
  }
};

exports.deleteCombo = async (req, res, next) => {
  try {
    await Combo.findByIdAndDelete(req.params.id);
    res.json({ message: "Combo deleted" });
  } catch (err) {
    next(err);
  }
};
