import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { auth } from "../middleware/auth.middleware.js"
import { healthcheck } from "../controllers/healthcheck.controllers.js";
const  healthcheckRouter = Router();
healthcheckRouter.route("/check").get(auth,healthcheck)
export{healthcheckRouter}