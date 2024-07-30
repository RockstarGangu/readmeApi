import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  hello,
  login,
  logout,
  refreshAccessToken,
  register,
  updateUserDetails,
  verifyEmail,
} from "../controllers/users.controller.js";
import { validateSchema } from "../middlewares/zod.middleware.js";
import {
  changePasswordSchema,
  loginSchema,
  newPasswordSchema,
  updateAccountSchema,
  userSchema,
} from "../services/zod.schema.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/healthy").get(hello);
router.route("/register").post(validateSchema(userSchema), register);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/login").post(validateSchema(loginSchema), login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh-Access-Token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/forgot-password/:id")
  .post(validateSchema(newPasswordSchema), forgotPassword);
router
  .route("/change-password")
  .post(validateSchema(changePasswordSchema), verifyJWT, changePassword);
router
  .route("/update-details")
  .patch(verifyJWT, validateSchema(updateAccountSchema), updateUserDetails);

export default router;
