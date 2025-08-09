import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getPublishedCreations,
  getUserCreations,
  toggleLikeCreation,
} from '../controllers/userController.js';

const userRoutes = express();

userRoutes.get('/getUserCreations', auth, getUserCreations);
userRoutes.get('/getPublishedCreations', auth, getPublishedCreations);
userRoutes.post('/toggleLikeCreation', auth, toggleLikeCreation);

export default userRoutes;
