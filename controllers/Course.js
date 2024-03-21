const Course = require("../models/Course");
const Tags = require("../models/Tags");
const User = require("../models/User");
const { uploadImgToCloudinary } = require("../utils/imageUploder");

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;
    const thumbnailImg = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnailImg
    ) {
      res.status(400).json({
        success: false,
        message: "need all course fields",
      });
    }

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);

    if (!instructorDetails) {
      res.status(400).json({
        success: false,
        message: "Instructo detials not found",
      });
    }

    const tagsDetails = Tags.findById(tag);

    if (!tagsDetails) {
      res.status(400).json({
        success: false,
        message: "tag detials not found",
      });
    }

    const thumbnailImage = await uploadImgToCloudinary(
      thumbnailImg,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName: courseName,
      couseDescription: courseDescription,
      instructor: instructorDetails._id,
      price,
      tag: tagsDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Course created",
      data: newCourse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "erroe creating course",
    });
  }
};

exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        couseDescription: true,
        instructor: true,
        price: true,
        thumbnail: true,
        ratingAndReviews: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "all Course fetched",
      data: allCourses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "erroe fetching course",
    });
  }
};
