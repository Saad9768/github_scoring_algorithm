import { RepoQueryDto } from "../model/repo.dto";
import { PagingResponse, Repository } from "../model/repo.interface";

export interface RepoService {
    fetchAndScoreRepos({ language, date, sort, pageNumber, pageSize }: RepoQueryDto): Promise<PagingResponse<Repository>>
}