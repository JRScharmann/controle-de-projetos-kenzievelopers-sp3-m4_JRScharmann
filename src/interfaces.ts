type TDeveloper = {
    id: number,
    name: string,
    email: string
}

type TDeveloperRequest =  Omit<TDeveloper, "id">

type TDeveloperInfoRequest = {
    developerSince: Date,
    preferredOS: "MacOS" | "Windows" | "Linux"
}

type TCreateDeveloperInfo = TDeveloperInfoRequest & {
    developerId: number
}

/* CREATE TABLE IF NOT EXISTS projects(
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL,
    "description"  TEXT,
    "estimatedTime" VARCHAR(20) NOT NULL,
    "repository" VARCHAR(120) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate"  DATE,
    "developerId" INTEGER UNIQUE,
    FOREIGN KEY ("developerId") REFERENCES developers("id")
) */

type TProject = {
    id: number,
    name: string,
    description: string,
    estimatedTime: string,
    repository: string,
    startDate: Date,
    endDate?: Date,
    developerId: number
}

type TProjectRequest =  Omit<TProject, "id">

export{
    TDeveloper,
    TDeveloperRequest,
    TCreateDeveloperInfo,
    TDeveloperInfoRequest,
    TProject,
    TProjectRequest
}