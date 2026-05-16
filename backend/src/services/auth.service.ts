import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateTokens';
import { ApiError } from '../utils/ApiError';
import { sendPasswordResetEmail } from './email.service';
import config from '../config';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  storageUsed: number;
  role: string;
  createdAt: Date;
}

const sanitizeUser = (user: IUser): UserProfile => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  storageUsed: user.storageUsed,
  role: user.role,
  createdAt: user.createdAt,
});

const generateTokens = async (user: IUser): Promise<TokenPair> => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(refreshToken);
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  await user.save();

  return { accessToken, refreshToken };
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ user: UserProfile; tokens: TokenPair }> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const tokens = await generateTokens(user);
  return { user: sanitizeUser(user), tokens };
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: UserProfile; tokens: TokenPair }> => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await generateTokens(user);
  return { user: sanitizeUser(user), tokens };
};

export const logout = async (userId: string, refreshToken: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
  await user.save();
};

export const refreshToken = async (token: string): Promise<TokenPair> => {
  let decoded: { userId: string; email: string; role: string };
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const storedToken = user.refreshTokens.find((t: string) => t === token);
  if (!storedToken) {
    user.refreshTokens = [];
    await user.save();
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  user.refreshTokens = user.refreshTokens.filter((t: string) => t !== token);
  const tokens = await generateTokens(user);
  return tokens;
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: 'If an account with that email exists, a reset link has been sent' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + config.resetTokenExpiry);
  await user.save();

  if (config.smtp.host) {
    await sendPasswordResetEmail(email, resetToken).catch((err) => {
      console.error(`Failed to send password reset email to ${email}:`, err.message);
    });
  } else {
    console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
  }

  return { message: 'If an account with that email exists, a reset link has been sent' };
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = [];
  await user.save();
};

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return sanitizeUser(user);
};

export const updateProfile = async (
  userId: string,
  updates: { name?: string; avatar?: string }
): Promise<UserProfile> => {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return sanitizeUser(user);
};
