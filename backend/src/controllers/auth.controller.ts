import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import asyncHandler from '../utils/asyncHandler';
import config from '../config';

const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
};

const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, tokens } = await authService.register(name, email, password);

  setRefreshTokenCookie(res, tokens.refreshToken);
  setAccessTokenCookie(res, tokens.accessToken);

  res.status(201).json(ApiResponse.created({ user, accessToken: tokens.accessToken }, 'Registration successful'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);

  setRefreshTokenCookie(res, tokens.refreshToken);
  setAccessTokenCookie(res, tokens.accessToken);

  res.status(200).json(ApiResponse.ok({ user, accessToken: tokens.accessToken }, 'Login successful'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken && req.user) {
    await authService.logout(req.user.userId, refreshToken);
  }

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.clearCookie('accessToken', { path: '/' });

  res.status(200).json(ApiResponse.ok(null, 'Logged out successfully'));
});

export const refreshTokenHandler = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: 'Refresh token is required' });
    return;
  }

  const tokens = await authService.refreshToken(token);

  setRefreshTokenCookie(res, tokens.refreshToken);
  setAccessTokenCookie(res, tokens.accessToken);

  res.status(200).json(ApiResponse.ok({ accessToken: tokens.accessToken }, 'Token refreshed'));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.user!.userId, oldPassword, newPassword);

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.clearCookie('accessToken', { path: '/' });

  res.status(200).json(ApiResponse.ok(null, 'Password changed successfully. Please login again.'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(200).json(ApiResponse.ok(null, result.message));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.status(200).json(ApiResponse.ok(null, 'Password reset successful'));
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.getProfile(req.user!.userId);
  res.status(200).json(ApiResponse.ok(profile));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, avatar } = req.body;
  const profile = await authService.updateProfile(req.user!.userId, { name, avatar });
  res.status(200).json(ApiResponse.ok(profile, 'Profile updated'));
});
