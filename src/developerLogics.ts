import { Request, Response } from "express";
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

   const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)


   return res.status(201).json(queryResult.rows[0])
}

const retrieveDeveloper = async (req: Request,
    res: Response
    ): Promise<Response> =>{

        const developer: TDeveloper = res.locals.developer
    
        return res.json(developer)
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

        const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)

        console.log(updateData)
    
        return res.json(updateData)
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
       developer_infos
           (%I)
       VALUES(%L)
           RETURNING *;`,
           Object.keys(data),
           Object.values(data))

   const queryResult: QueryResult<TDeveloper> = await client.query(queryString)


   return res.status(201).json(queryResult.rows[0])
}

export {
    createDeveloper,
    retrieveDeveloper,
    updateDeveloper,
    deleteDeveloper,
    createDeveloperInfo
}