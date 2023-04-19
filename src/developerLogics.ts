import { Request, Response, request } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "./database";
import { TCreateDeveloperInfo, TDeveloper, TDeveloperInfoRequest, TDeveloperRequest } from "./interfaces";
import format from "pg-format";


const createDeveloper = async (
    req: Request,
    res: Response
    ): Promise<Response> => {

    const developerData: TDeveloperRequest = req.body

    const queryString:string = `
       INSERT INTO
       developers
           ("name", "email")
       VALUES
               ($1,$2)
           RETURNING *;
    ` 

   const queryConfig: QueryConfig = {
       text: queryString ,
       values: Object.values(developerData),
   }
    try{
        const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)
        return res.status(201).json(queryResult.rows[0])
    }catch(error: any){
        if(error.message === 'duplicate key value violates unique constraint "developers_email_key"'){
            return res.status(409).json({
                message: "Email already exists!"
            })
        }
        return res.status(500)
    }
}

const retrieveDeveloper = async (req: Request,
    res: Response
    ): Promise<Response> =>{

        const id: number = parseInt(req.params.id)

        const queryString: string = `
        SELECT *
        FROM developers AS d 
        LEFT JOIN developer_infos AS di ON "developerId" = d.id
        WHERE d.id = $1;
        `
        const queryConfig: QueryConfig = {
            text: queryString,
            values: [id]
        }

        const queryResult: QueryResult = await client.query(queryConfig)
    
        if(queryResult.rowCount === 0){
            return res.status(404).json({
                message: "Developer not found."
            })
        }

        const dev = queryResult.rows[0]

        return res.status(200).json({
            developerId: id,
            developerName: dev.name,
            developerEmail: dev.email,
            developerInfoDeveloperSince: dev.developerSince,
            developerInfoPreferredOS: dev.preferredOS
          })
    }

const updateDeveloper = async (req: Request,
    res: Response
    ): Promise<Response> =>{
        const id: number = parseInt(req.params.id)
        const updateData: Partial<TDeveloperRequest> = req.body 

        const queryString: string = format(`
        UPDATE
            developers
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

        try{
            const queryResult: QueryResult = await client.query(queryConfig)
            if(queryResult.rowCount === 0){
                return res.status(404).json({
                    message: "Developer not found."
                })
            }
            return res.json(updateData)
        }catch(error: any){
            if(error.message === 'duplicate key value violates unique constraint "developers_email_key"'){
                return res.status(409).json({
                    message: "Email already exists!"
                })
            }
            return res.status(500)
        }
    
    }

    const deleteDeveloper = async (req: Request,
        res: Response
        ): Promise<Response> => {
    
            const id: number = parseInt(req.params.id)
    
            const queryString: string = `
            DELETE FROM
                developers
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

    const createDeveloperInfo = async (
    req: Request,
    res: Response
    ): Promise<Response> => {

        const developerInfoData: TDeveloperInfoRequest = req.body
        const developerId: number = parseInt(req.params.id)

        const data: TCreateDeveloperInfo = {
            ...developerInfoData,
            developerId
        }

       const queryString:string = format(`
        INSERT INTO
        developer_infos(%I)
        VALUES(%L)
        RETURNING *;`,
        Object.keys(data),
        Object.values(data))

    try{
        const queryResult: QueryResult = await client.query(queryString)
        return res.status(201).json(queryResult.rows[0])
    }catch(error: any){
        if(error.message === 'duplicate key value violates unique constraint "developer_infos_developerId_key"'){
            return res.status(409).json({
            message: "Developer infos already exists."
            })
        }
        if(error.message.startsWith('invalid input value for enum "OS":')){
            return res.status(400).json({
            message: "Invalid OS option.",
            options: ["Windows", "Linux", "MacOS"]
            })
        }
    return res.status(500)
    }

}

export {
    createDeveloper,
    retrieveDeveloper,
    updateDeveloper,
    deleteDeveloper,
    createDeveloperInfo
}