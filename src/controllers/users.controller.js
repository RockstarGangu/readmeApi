import User from "../models/users.model.js";
import sendEmail from "../services/resend.email.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hello = (req, res) => {
  return res.send("Hello am healthy");
};

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({
    validateBeforeSave: false,
  });

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(201).json({ message: "All fields are required" });
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  createdUser.verificationToken = crypto.randomBytes(20).toString("hex");

  await createdUser.save();

  sendEmail(createdUser.email, createdUser.verificationToken);

  if (!createdUser) {
    return res.status(500).json({ message: "Something went wrong" });
  }

  return res.status(201).json({
    user: createdUser,
    message: "User created successfully",
    status: 200,
  });
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    user.isverified = true;
    user.verificationToken = undefined;
    await user.save();
    return res.status(200).json({ message: "Email Verified" });
  } catch (error) {
    res.status(500).json({ message: "Email Verification Failed" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordCorrect = await user.checkPassword(password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  if (!user.isverified) {
    return res.status(400).json({ message: "Please verify your email" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      user: loggedInUser,
      message: "Login successful",
      status: 200,
    });
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = { httpOnly: true, secure: true };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "Logout successful", status: 200 });
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(400).json({ message: "unauthorized request" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      res.status(401).json({ message: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      res.status(401).json({ message: "Refresh token is expired or used" });
    }

    if (!user.isverified) {
      return res.status(401).json({ message: "Please verify your email" });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        accessToken,
        refreshToken: newRefreshToken,
        message: "Access token refreshed",
      });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Something went wrong" });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: req.user, status: 200 });
};

const forgotPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    return res.status(201).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        password: hashPassword,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json({ message: "Password reset successful", status: 200 });
};

const changePassword = async (req, res) => {
  const {oldPassword, newPassword} = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(201).json({ message: "All fields are required" });
  }

  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await user.checkPassword(oldPassword);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave:false });

  return res.status(200).json({ message: "Password changed successfully", status: 200 });

}

const updateUserDetails = async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken -__v");

  if (email !== user.email) {
    sendEmail(user.email, user.verificationToken);
  }

  return res
    .status(200)
    .json({ user, status: 200, message: "User details updated successfully" });
};

export {
  hello,
  register,
  verifyEmail,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  forgotPassword,
  updateUserDetails,
  changePassword
};
