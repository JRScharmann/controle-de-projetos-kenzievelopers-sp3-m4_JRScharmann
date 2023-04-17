import express, { Application } from "express";
import "dotenv/config";
import { createDeveloper, createDeveloperInfo, deleteDeveloper, retrieveDeveloper, updateDeveloper } from "./developerLogics";
import { ensureDeveloperExistsMiddleware, ensureEmailDontExist, ensureProjectExistsMiddleware } from "./middleware";
import { createProject, deleteProject, updateProject } from "./projectsLogics";

const app: Application = express();
app.use(express.json())

app.post("/developers", ensureEmailDontExist,createDeveloper)
app.get("/developers/:id",ensureDeveloperExistsMiddleware,retrieveDeveloper)
app.patch("/developers/:id", ensureDeveloperExistsMiddleware, updateDeveloper)
app.delete("/developers/:id", ensureDeveloperExistsMiddleware, deleteDeveloper)
app.post("/developers/:id/infos", createDeveloperInfo)

app.post("/projects", createProject)
app.patch("/projects/:id", ensureProjectExistsMiddleware,ensureDeveloperExistsMiddleware, updateProject)
app.delete("/projects/:id", ensureProjectExistsMiddleware,ensureDeveloperExistsMiddleware, deleteProject)


export default app;
