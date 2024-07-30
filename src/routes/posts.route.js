import { Router } from "express";
import { validateSchema } from "../middlewares/zod.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  addASingleRelatedMedia,
  addContent,
  deletePost,
  deleteSingleRelatedMedia,
  getAllPosts,
  getSinglePost,
  updateContent,
} from "../controllers/content.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { contentSchema } from "../services/zod.schema.js";
import {
  addATag,
  addMultipleTags,
  deleteAllTags,
  deleteATag,
  updateATag,
} from "../controllers/tags.controller.js";
const router = Router();

router
  .route("/add-a-post")
  .post(
    upload.array("relatedMedia", 5),
    validateSchema(contentSchema),
    verifyJWT,
    addContent
  );

router.route("/get-all-posts").get(verifyJWT, getAllPosts);

router.route("/get-a-post/:id").get(verifyJWT, getSinglePost);

router.route("/update-a-post/:id").patch(verifyJWT, updateContent);

router.route("/delete-a-post/:id").delete(verifyJWT, deletePost);

router
  .route("/add-a-media/:id")
  .post(verifyJWT, upload.single("relatedMedia"), addASingleRelatedMedia);

router
  .route("/delete-a-media/:id/:publicId")
  .delete(verifyJWT, deleteSingleRelatedMedia);

router.route("/add-a-tag/:id").post(verifyJWT, addATag);

router.route("/add-multiple-tags/:id").post(verifyJWT, addMultipleTags);

router.route("/delete-all-tags/:id").delete(verifyJWT, deleteAllTags);

router.route("/delete-a-tag/:id/:tag").delete(verifyJWT, deleteATag);

router.route("/update-a-tag:/id/:tag").patch(verifyJWT, updateATag);

export default router;
