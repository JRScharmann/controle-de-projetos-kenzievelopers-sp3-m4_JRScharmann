import express, { Application } from "express";
import "dotenv/config";
import { createDeveloper, createDeveloperInfo, deleteDeveloper, retrieveDeveloper, updateDeveloper } from "./developerLogics";
import { ensureDeveloperExistsMiddleware, ensureEmailDontExist, ensureProjectExistsMiddleware } from "./middleware";
import { addTech, createProject, deleteProject, deleteTech, retrieveProject, updateProject } from "./projectsLogics";

const app: Application = express();
app.use(express.json())

app.post("/developers", createDeveloper)
app.get("/developers/:id",retrieveDeveloper)
app.patch("/developers/:id", updateDeveloper)
app.delete("/developers/:id", ensureDeveloperExistsMiddleware, deleteDeveloper)
app.post("/developers/:id/infos", ensureDeveloperExistsMiddleware,createDeveloperInfo)

app.post("/projects", createProject)
app.get("/projects/:id",retrieveProject)
app.patch("/projects/:id", updateProject)
app.delete("/projects/:id", ensureProjectExistsMiddleware,ensureDeveloperExistsMiddleware, deleteProject)
app.post("/projects/:id/technologies", addTech)
app.delete("/projects/:id/technologies/:name", deleteTech)


export default app;
