const Tags = require("../models/Tags");

exports.createTsg = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "all tages field are quired",
      });
    }

    const tagDetails = await Tags.create({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "enterred success tags",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "all tages field are quired",
    });
  }
};

exports.showAllTags = async (req, res) => {
  try {
    const alltags = await Tags.find({}, { name: true, description: true });
    res.status(200).json({
      success: true,
      message: "get all tags success",
      alltags,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "all tages failed",
    });
  }
};
