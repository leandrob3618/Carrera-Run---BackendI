
import { Router } from 'express'
const router = Router()

router.get('/', (req,res) => res.send('Ruta Carts OK'))

export default router