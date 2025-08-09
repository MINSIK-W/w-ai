import express, { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  article,
  background,
  blogTitle,
  images,
  object,
  resumes,
} from '../controllers/aiController.js';
import { upload } from '../configs/multer.js';

const aiRouter: Router = express.Router();

aiRouter.post('/article', auth, article);
aiRouter.post('/title', auth, blogTitle);
aiRouter.post('/images', auth, images);
aiRouter.post('/background', upload.single('image'), auth, background);
aiRouter.post('/object', upload.single('image'), auth, object);
aiRouter.post('/resumes', upload.single('resume'), auth, resumes);

export default aiRouter;
