import Content from "../models/content.model.js";

const deleteATag = async (req, res) => {
  const post = await Content.findById(req.params.id);
  const tags = post.tags;
  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === req.params.tag) {
      tags.splice(i, 1);
    }
  }
  post.tags = tags;
  await post.save({ validateBeforeSave: false });
  res.status(200).json({ message: "Tag deleted successfully", status: 200 });
};

const addATag = async (req, res) => {
  const post = await Content.findById(req.params.id);
  const tags = post.tags;
  const {toAddTags} = req.body;
  tags.push(toAddTags);
  post.tags = tags;
  await post.save({ validateBeforeSave: false });
  res.status(200).json({ data:post.tags,message: "Tag added successfully", status: 200 });
};

const deleteAllTags = async (req, res) => {
  const post = await Content.findById(req.params.id);
  post.tags = [];
  await post.save({ validateBeforeSave: false });
  res
    .status(200)
    .json({ message: "All tags deleted successfully", status: 200 });
};

const addMultipleTags = async (req, res) => {
  const post = await Content.findById(req.params.id);
  const tags = post.tags;
  tags.push(...req.body.tags);
  post.tags = tags;
  await post.save({ validateBeforeSave: false });
  res.status(200).json({data:post.tags ,message: "Tags added successfully", status: 200 });
};

const updateATag = async (req, res) => {
  const post = await Content.findById(req.params.id);
  const tags = post.tags;
  for (let i = 0; i < tags.length; i++) {
    if (tags[i] === req.params.tag) {
      tags[i] = req.body.tags;
    }
  }
  post.tags = tags;
  await post.save({ validateBeforeSave: false });
  res.status(200).json({ message: "Tag updated successfully", status: 200 });
};

export { deleteATag, addATag, deleteAllTags, addMultipleTags, updateATag };
