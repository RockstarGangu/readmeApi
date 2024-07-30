import mongoose from "mongoose";

const contentModel = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    relatedMedia: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        required: true,
        index: true,
        unique: true,
      },
    ],
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentModel);

export default Content;
