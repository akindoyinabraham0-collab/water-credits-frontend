import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  AnalyticsOverview,
  CreditsOverTimePoint,
  ProjectDistribution,
  RetirementByPurpose,
  TopProject,
  TopRetiree,
} from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiService) {}

  async getOverview(): Promise<AnalyticsOverview> {
    return this.api.get<AnalyticsOverview>('/analytics/overview');
  }

  async getCreditsOverTime(days = 30): Promise<CreditsOverTimePoint[]> {
    return this.api.get<CreditsOverTimePoint[]>('/analytics/credits-over-time', {
      params: { days },
    });
  }

  async getProjectDistribution(): Promise<ProjectDistribution[]> {
    return this.api.get<ProjectDistribution[]>('/analytics/project-distribution');
  }

  async getRetirementByPurpose(): Promise<RetirementByPurpose[]> {
    return this.api.get<RetirementByPurpose[]>('/analytics/retirement-by-purpose');
  }

  async getTopProjects(limit = 5): Promise<TopProject[]> {
    return this.api.get<TopProject[]>('/analytics/top-projects', { params: { limit } });
  }

  async getTopRetirees(limit = 5): Promise<TopRetiree[]> {
    return this.api.get<TopRetiree[]>('/analytics/top-retirees', { params: { limit } });
  }
}
