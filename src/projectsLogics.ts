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
        return res.status(500)
    }
}

const retrieveProject = async (req: Request,
    res: Response
    ): Promise<Response> =>{

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
    
        console.log(queryResult)

        if(queryResult.rowCount === 0){
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
            "id" = $1;
        `,
        Object.keys(updateData),
        Object.values(updateData))

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    }

    const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)

    return res.json(updateData)
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

export {
    createProject,
    updateProject,
    deleteProject,
    retrieveProject
}