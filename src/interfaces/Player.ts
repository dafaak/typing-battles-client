export interface Player {
    conn_id: string
    name: string
    score: number
    progress?: number
    is_ready: boolean
    room: string
}