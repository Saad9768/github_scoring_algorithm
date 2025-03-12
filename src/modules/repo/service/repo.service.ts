import { RepoQueryDto } from "../model/repo.dto";
import { PageInfo, Repository } from "../model/repo.interface";

export interface RepoService {
    fetchAndScoreRepos({ language, date, sort, pageNumber, pageSize }: RepoQueryDto): Promise<{
        nodes: Repository[];
        pageInfo: PageInfo;
        repositoryCount: number;
    }>
}