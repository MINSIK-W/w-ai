import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from '@/routes/aiRoutes';
import connectCloudinary from '@/configs/cloudinary';
import userRoutes from '@/routes/userRoutes';

const app = express();

await connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req: express.Request, res: express.Response) =>
  res.send('라이브 서버 시작')
);

app.use(requireAuth());

app.use('/api/ai', aiRouter);
app.use('/api/user', userRoutes);

const SERVER_PORT = process.env.PORT || 3000;

app.listen(SERVER_PORT, () => {
  console.log('서버 포트 ' + SERVER_PORT);
});
