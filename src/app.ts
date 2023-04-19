import express, { Application } from "express";
import "dotenv/config";
import { createDeveloper, createDeveloperInfo, deleteDeveloper, retrieveDeveloper, updateDeveloper } from "./developerLogics";
import { ensureDeveloperExistsMiddleware, ensureEmailDontExist, ensureProjectExistsMiddleware } from "./middleware";
import { createProject, deleteProject, retrieveProject, updateProject } from "./projectsLogics";

const app: Application = express();
app.use(express.json())

app.post("/developers", createDeveloper)
app.get("/developers/:id",retrieveDeveloper)
app.patch("/developers/:id", updateDeveloper)
app.delete("/developers/:id", ensureDeveloperExistsMiddleware, deleteDeveloper)
app.post("/developers/:id/infos", ensureDeveloperExistsMiddleware,createDeveloperInfo)

app.post("/projects", createProject)
app.get("/projects/:id",retrieveProject)
app.patch("/projects/:id", ensureProjectExistsMiddleware,ensureDeveloperExistsMiddleware, updateProject)
app.delete("/projects/:id", ensureProjectExistsMiddleware,ensureDeveloperExistsMiddleware, deleteProject)


export default app;
