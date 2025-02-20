import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsDate
} from 'class-validator';

export class RepoQueryDto {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['stars', 'forks'], { message: "Sort must be one of 'star', 'forks'" })
  sort: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['asc', 'desc'], { message: "Order must be either 'asc' or 'desc'" })
  order: string;

  @IsNotEmpty()
  date: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  pageSize: number = 10;
}
