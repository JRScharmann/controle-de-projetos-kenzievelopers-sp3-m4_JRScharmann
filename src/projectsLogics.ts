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

    const queryString:string = `
       INSERT INTO
       projects
           ("name", "description","estimatedTime","repository","startDate","developerId")
       VALUES
               ($1,$2,$3,$4,$5,$6)
           RETURNING *;
    ` 

   const queryConfig: QueryConfig = {
       text: queryString ,
       values: Object.values(projectData),
   }

   const queryResult: QueryResult<TProject> = await client.query(queryConfig)


   return res.status(201).json(queryResult.rows[0])
}

const updateProject = async (req: Request,
    res: Response
    ): Promise<Response> =>{
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
    deleteProject
}