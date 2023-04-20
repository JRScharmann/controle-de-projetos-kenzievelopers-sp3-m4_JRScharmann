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