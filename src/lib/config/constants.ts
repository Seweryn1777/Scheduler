export enum TimeIntervalMs {
    Second = 1000,
    Minute = TimeIntervalMs.Second * 60,
    Hour = TimeIntervalMs.Minute * 60,
    Day = TimeIntervalMs.Hour * 24
}

export enum HeadersKey {
    ApiKey = 'api-key',
    Authorization = 'authorization'
}

export enum NodeEnv {
    Development = 'development',
    Staging = 'staging',
    Production = 'production',
    Test = 'test'
}

export enum SecondInterval {
    Second = 1,
    Minute = SecondInterval.Second * 60,
    Hour = SecondInterval.Minute * 60,
    Day = SecondInterval.Hour * 24
}
