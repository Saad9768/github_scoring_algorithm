export interface ScoreService {
    calculateScore(stars: number, forks: number, lastUpdated: Date): number
}