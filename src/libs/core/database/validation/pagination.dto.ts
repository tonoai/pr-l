import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PAGINATION_ARGS } from '../const/pagination-args';
import { BaseSearchDto } from '../../base/base-search-dto';

export class PaginationDto extends BaseSearchDto {
  @IsInt()
  @Transform(({ value }) => {
    return parseInt(value, 10) > 0 ? parseInt(value, 10) : 1;
  })
  @IsOptional()
  page = PAGINATION_ARGS.page;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => {
    return parseInt(value, 10) >= 0 ? parseInt(value, 10) : undefined;
  })
  @IsOptional()
  skip?: number;
}
