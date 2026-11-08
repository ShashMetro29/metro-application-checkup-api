import { AuthService } from '../services/auth.service.js';
import { UserModel } from '../models/user.model.js';

export const AuthController = {
  signup: async (req, res) => {
    const payload = await AuthService.signup(req.validated.body);
    res.status(201).json(payload);
  },

  login: async (req, res) => {
    const payload = await AuthService.login(req.validated.body.email, req.validated.body.password);
    res.json(payload);
  },

  me: async (req, res) => {
    res.json(await UserModel.profile(req.user.id));
  }
};
