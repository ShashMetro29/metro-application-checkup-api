import { Router } from 'express'; import authRoutes from './auth.routes.js'; import inventoryRoutes from './inventory.routes.js';
const router=Router();router.use('/auth',authRoutes);router.use('/',inventoryRoutes);export default router;
