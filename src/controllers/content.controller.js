import Content from "../models/content.model.js";
import {
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../services/cloudinary.media.js";
const addContent = async (req, res) => {
  const { title, code, description, tags } = req.body;

  if (!title || !code || !description || !tags) {
    return res
      .status(400)
      .json({ message: "All fields are required", status: 400 });
  }

  const author = req.user._id;

  const relatedMediaPath = req.files;

  const multiplePicturePromise = relatedMediaPath.map(
    async (picture) => await uploadOnCloudinary(picture.path)
  );

  const imageResponses = await Promise.all(multiplePicturePromise);
  const relatedMedia = imageResponses.map((image) => image.url);

  const content = await Content.create({
    author,
    title,
    relatedMedia,
    code,
    description,
    tags,
  });

  if (!content) {
    return res
      .status(401)
      .json({ message: "Something went wrong", status: 400 });
  }

  return res.status(200).json({
    data: content,
    message: "Content added successfully",
    status: 200,
  });
};

const getAllPosts = async (req, res) => {
  const posts = await Content.find();
  res.status(200).json({ data: posts });
};

const getSinglePost = async (req, res) => {
  const post = await Content.findById(req.params.id);
  res.status(200).json({ data: post });
};

const updateContent = async (req, res) => {
  const { title, description, code, tags } = req.body;
  const post = await Content.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title,
        description,
        code,
        tags,
      },
    },
    { new: true }
  );

  if (!post) {
    return res.status(404).json({ message: "Content not found", status: 404 });
  }
  res
    .status(200)
    .json({ data: post, message: "Content updated successfully", status: 200 });
};


const deleteSingleRelatedMedia = async (req, res) => {
  const post = await Content.findById(req.params.id);
  const publicId = req.params.publicId;
  await deleteOnCloudinary(publicId);
  post.relatedMedia = post.relatedMedia.filter(
    (media) => media !== media.includes(publicId)
  )
  await post.save({ validateBeforeSave: false });
  res.status(200).json({ message: "Media deleted successfully", status: 200 });
};

const addASingleRelatedMedia = async (req, res) => {
  const post = await Content.findById(req.params.id);
  const singleFilePath = req.file.path;
  const singleMedia = await uploadOnCloudinary(singleFilePath);
  post.relatedMedia.push(singleMedia.url);
  await post.save({ validateBeforeSave: false });
  res.status(200).json({ message: "Media added successfully", status: 200 });
};

const deletePost = async (req, res) => {
  const item = req.params.id;
  if (!item) {
    return res
      .status(400)
      .json({ message: "Please provide any post to delete", status: 400 });
  }
  const postImages = await Content.findById(item);

  const relatedMedia = postImages.relatedMedia
  console.log(relatedMedia)

  const getPublicId = (ImageUrl) => ImageUrl.split("/").pop().split(".")[0];

  relatedMedia.forEach((media) => {
    deleteOnCloudinary(getPublicId(media));
  });

  postImages.relatedMedia = [];
  await Content.findByIdAndDelete(item);
  res
    .status(200)
    .json({ message: "Content deleted successfully", status: 200 });
};

export {
  addContent,
  getAllPosts,
  getSinglePost,
  updateContent,
  deletePost,
  addASingleRelatedMedia,
  deleteSingleRelatedMedia,
};
