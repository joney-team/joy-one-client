import { Args, Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { ReportEntity, ReportResponseType } from './entities/report.entity';
import { ReportsService } from './reports.service';
import {
  ExportTimeSeriesReportInput,
  CombineTimeSeriesReport,
  CombineMetricsReport,
} from './reports.types';
import { PaginatedResponse } from 'src/database/database.utils';
import { Auth, Member } from 'src/app.decorators';
import { WorkspaceMember } from 'src/workspace-members/entities/workspace-member.entity';

@ObjectType()
export class MetricsReport extends ReportResponseType(CombineMetricsReport) {}

@ObjectType()
export class TimeSeriesReport extends ReportResponseType(
  CombineTimeSeriesReport,
) {}

@ObjectType()
export class TimeSeriesReports extends PaginatedResponse(TimeSeriesReport) {}

@ObjectType()
export class PeriodReport {
  @Field()
  total: number;

  @Field(() => [ReportEntity<CombineTimeSeriesReport>])
  results: ReportEntity<CombineTimeSeriesReport>[];
}

@Resolver(() => ReportEntity)
export class ReportsResolver {
  constructor(private readonly service: ReportsService) {}

  @Query(() => TimeSeriesReports)
  @Auth({ member: true })
  async getTimeSeriesReports(
    @Args('input') input: ExportTimeSeriesReportInput,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.getTimeSeries({ input, member });
  }

  @Query(() => TimeSeriesReport)
  @Auth({ member: true })
  async getTimeSeriesReport(
    @Args('id', { type: () => String }) id: string,
    @Member() member: WorkspaceMember,
  ) {
    return this.service.get({ id, member });
  }

  @Query(() => MetricsReport)
  @Auth({ member: true })
  async getMetricsReport(@Member() member: WorkspaceMember) {
    return this.service.getMetrics(member);
  }
}
