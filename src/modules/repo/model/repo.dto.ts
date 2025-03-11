import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  pageSize: number = 10;
}
