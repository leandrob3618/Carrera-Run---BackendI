
import { Router } from 'express'
const router = Router()

router.get('/', (req, res) => {
    res.json({msg: "carritos ok"})
})

export default router