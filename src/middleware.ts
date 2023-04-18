import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "./database";
import { TDeveloper } from "./interfaces";

const ensureDeveloperExistsMiddleware = async (req: Request,
    res: Response,
    next: NextFunction
    ): Promise<Response | void> =>{   
        let id: number = parseInt(req.params.id)

        if(req.route.path === '/projects'){
            id = req.body.developerId
        }
    
        const queryString: string = `
            SELECT 
                *
            FROM
                developers
            WHERE
                id = $1;
        `
    
        const queryConfig: QueryConfig = {
            text: queryString,
            values: [id]
        }

        const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)

        if(queryResult.rowCount === 0){
            return res.status(404).json({
                message: "Developer not found!"
            })
        }

    res.locals.developer = queryResult.rows[0]

    return next()

}

const ensureEmailDontExist = async (req: Request,
    res: Response,
    next: NextFunction
    ): Promise<Response | void> =>{
    
        const email: any = req.body.email

        console.log(email)

        const queryString: string = `
            SELECT 
                *
            FROM
                developers
            WHERE
                email = $1;
        `
    
        const queryConfig: QueryConfig = {
            text: queryString,
            values: [email]
        }

        const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)

        console.log(queryConfig)
        console.log(queryResult)

        if(queryResult.rowCount !== 0){
            return res.status(409).json({
                message: "Email already exists!"
            })
        }

    return next()
}

const ensureProjectExistsMiddleware = async (req: Request,
    res: Response,
    next: NextFunction
    ): Promise<Response | void> =>{   
        let id: number = parseInt(req.params.id)

        if(req.route.path === '/projects' && req.method === 'POST'){
            id = req.body.developerId
        }
    
        const queryString: string = `
            SELECT 
                *
            FROM
                projects
            WHERE
                id = $1;
        `
    
        const queryConfig: QueryConfig = {
            text: queryString,
            values: [id]
        }

        const queryResult: QueryResult<TDeveloper> = await client.query(queryConfig)

        if(queryResult.rowCount === 0){
            return res.status(404).json({
                message: "Project not found!"
            })
        }

    res.locals.project = queryResult.rows[0]

    return next()
}

export {
    ensureEmailDontExist,
    ensureDeveloperExistsMiddleware,
    ensureProjectExistsMiddleware
}