import { RepoQueryDto } from "../model/repo.dto";
import { Repository } from "../model/repo.interface";

export interface RepoService {
    fetchAndScoreRepos({ language, date, sort, pageNumber, pageSize }: RepoQueryDto): Promise<Repository[]>
}