import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "./database";
import { TCreateDeveloperInfo, TDeveloper, TDeveloperInfoRequest, TDeveloperRequest, TProject, TProjectRequest } from "./interfaces";
import format from "pg-format";


const createProject = async (
    req: Request,
    res: Response
): Promise<Response> => {

    const projectData: TProjectRequest = req.body

    const queryString: string = `
       INSERT INTO
       projects
           ("name", "description","estimatedTime","repository","startDate","developerId")
       VALUES
               ($1,$2,$3,$4,$5,$6)
           RETURNING *;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: Object.values(projectData),
    }

    try {
        const queryResult: QueryResult = await client.query(queryConfig)
        return res.status(201).json(queryResult.rows[0])
    } catch (error: any) {
        if (error.message === 'insert or update on table "projects" violates foreign key constraint "projects_developerId_fkey"') {
            return res.status(404).json({
                message: "Developer not found."
            })
        }
        return res.status(500).send()
    }
}

const retrieveProject = async (req: Request,
    res: Response
): Promise<Response> => {

    const id: number = parseInt(req.params.id)

    const queryString: string = `
        SELECT
            *, p.id AS pid, t.id AS tid, p.name AS pname, t.name AS tname
        FROM
            projects_technologies AS pt
            JOIN projects AS p ON p.id = "projectId"
            JOIN technologies AS t ON t.id = "technologyId"
        WHERE
            "projectId" = $1;
        `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult: QueryResult = await client.query(queryConfig)

    if (queryResult.rowCount === 0) {
        return res.status(404).json({
            message: "Project not found."
        })
    }

    const proj = queryResult.rows.map(r => ({
        projectId: r.pid,
        projectName: r.pname,
        projectDescription: r.description,
        projectEstimatedTime: r.estimatedTime,
        projectRepository: r.repository,
        projectStartDate: r.startDate,
        projectEndDate: r.endDate,
        projectDeveloperId: r.developerId,
        technologyId: r.tid,
        technologyName: r.tname
    }))

    return res.status(200).json(proj)
}

const updateProject = async (req: Request,
    res: Response
): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const updateData: Partial<TDeveloperRequest> = req.body

    const queryString: string = format(`
        UPDATE
            projects
        SET(%I) = ROW(%L)
        WHERE
            "id" = $1
        RETURNING *;
        `,
        Object.keys(updateData),
        Object.values(updateData))

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    try {
        const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)
        if (queryResult.rowCount === 0) {
            return res.status(404).json({
                message: "Project not found."
            })
        }
        return res.json(queryResult.rows[0])
    } catch (error: any) {
        if (error.message === 'insert or update on table "projects" violates foreign key constraint "projects_developerId_fkey"') {
            return res.status(404).json({
                message: "Developer not found."
            })
        }
        return res.status(500).send()
    }

}

const deleteProject = async (req: Request,
    res: Response
): Promise<Response> => {

    const id: number = parseInt(req.params.id)

    const queryString: string = `
            DELETE FROM
                projects
            WHERE
                id = $1;
            `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    await client.query(queryConfig)

    return res.status(204).send()

}

const addTech = async (
    req: Request,
    res: Response
): Promise<Response> => {

    const techName: TProjectRequest = req.body.name
    const id: number = parseInt(req.params.id)

    const queryString: string = `
    SELECT
        *, (SELECT id FROM technologies WHERE name = $1 ) AS tid
    FROM
        projects AS p
    WHERE
        p.id = $2;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [techName, id],
    }

    try {
        const queryResult: QueryResult = await client.query(queryConfig)
        if (queryResult.rowCount === 0) {
            return res.status(404).json({
                message: "Project not found."
            })
        }
        const row = queryResult.rows[0]
        if (row.tid === null) {
            return res.status(400).json({
                message: "Technology not supported.",
                options: [
                    "JavaScript",
                    "Python",
                    "React",
                    "Express.js",
                    "HTML",
                    "CSS",
                    "Django",
                    "PostgreSQL",
                    "MongoDB"
                ]
            })
        }
        const insertQueryString: string = `
        INSERT INTO 
            "projects_technologies" ("addedIn", "technologyId", "projectId") 
        VALUES 
            ($1,$2,$3);
        `
        const insertQueryConfig: QueryConfig = {
            text: insertQueryString,
            values: [new Date(), row.tid, id],
        }
        await client.query(insertQueryConfig)
        return res.status(201).json({
            technologyId: row.tid,
            technologyName: techName,
            projectId: id,
            projectName: row.name,
            projectDescription: row.description,
            projectEstimatedTime: row.estimatedTime,
            projectRepository: row.repository,
            projectStartDate: row.startDate,
            projectEndDate: row.endDate
        })
    } catch (error: any) {
        if (error.message === 'duplicate key value violates unique constraint "projects_technologies_technologyId_projectId_key"') {
            return res.status(409).json({
                message: "This technology is already associated with the project"
            })
        }
        return res.status(500).send()
    }
}

const deleteTech = async (req: Request,
    res: Response
): Promise<Response> => {
    const id: number = parseInt(req.params.id)
    const name: string = req.params.name

    const queryString: string = `
    SELECT
    (SELECT id FROM technologies WHERE name = $1 ) AS tid
    FROM
    projects AS p
    WHERE
    p.id = $2;
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [name, id],
    }

    try {
        const queryResult: QueryResult = await client.query(queryConfig)
        if (queryResult.rowCount === 0) {
            return res.status(404).json({
                message: "Project not found."
            })
        }
        const row = queryResult.rows[0]
        if (row.tid === null) {
            return res.status(400).json({
                message: "Technology not supported.",
                options: [
                    "JavaScript",
                    "Python",
                    "React",
                    "Express.js",
                    "HTML",
                    "CSS",
                    "Django",
                    "PostgreSQL",
                    "MongoDB"
                ]
            })
        }
        const deleteQueryString: string = `
        DELETE FROM
        projects_technologies
        WHERE
        "projectId" = $1
        AND "technologyId" = $2;
    `
        const deleteQueryConfig: QueryConfig = {
            text: deleteQueryString,
            values: [id, row.tid],
        }
        const deleteResult: QueryResult = await client.query(deleteQueryConfig)
        if (deleteResult.rowCount === 0) {
            return res.status(400).json({
                message: "Technology not related to the project."
            })
        }
        return res.status(204).send()
    } catch (error: any) {
        return res.status(500).send()
    }
}

export {
    createProject,
    updateProject,
    deleteProject,
    retrieveProject,
    addTech,
    deleteTech
}