import axios, { AxiosInstance } from 'axios';
import type { Feed, Category, Entry, EntriesResponse, User, MinifluxConfig, FeedCounters } from '../types/miniflux';

class MinifluxClient {
  private client: AxiosInstance | null = null;
  private _config: MinifluxConfig | null = null;

  init(newConfig: MinifluxConfig) {
    // Store config for potential future use
    void this._config;
    this._config = newConfig;
    this.client = axios.create({
      baseURL: newConfig.baseUrl + '/v1',
      headers: {
        'X-Auth-Token': newConfig.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getUser();
      return true;
    } catch {
      return false;
    }
  }

  async getUser(): Promise<User> {
    const response = await this.client!.get('/me');
    return response.data;
  }

  async getFeeds(): Promise<Feed[]> {
    const response = await this.client!.get('/feeds');
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.client!.get('/categories');
    return response.data;
  }

  async getEntries(
    feedId?: number,
    status?: string,
    order: string = 'published_at',
    direction: string = 'desc',
    limit: number = 100,
    offset: number = 0
  ): Promise<EntriesResponse> {
    const params: Record<string, string | number> = {
      order,
      direction,
      limit,
      offset,
    };

    if (status) {
      params.status = status;
    }

    if (feedId) {
      params.feed_id = feedId;
    }

    const response = await this.client!.get('/entries', { params });
    return response.data;
  }

  async getEntry(entryId: number): Promise<Entry> {
    const response = await this.client!.get(`/entries/${entryId}`);
    return response.data;
  }

  async updateEntries(entryIds: number[], status: 'read' | 'unread'): Promise<void> {
    await this.client!.put('/entries', {
      entry_ids: entryIds,
      status,
    });
  }

  async toggleBookmark(entryId: number): Promise<void> {
    await this.client!.put(`/entries/${entryId}/bookmark`);
  }

  async markCategoryAsRead(categoryId: number): Promise<void> {
    await this.client!.put(`/categories/${categoryId}/mark-all-as-read`);
  }

  async markFeedAsRead(feedId: number): Promise<void> {
    await this.client!.put(`/feeds/${feedId}/mark-all-as-read`);
  }

  async getFeedCounters(): Promise<FeedCounters> {
    const response = await this.client!.get('/feeds/counters');
    return response.data;
  }

  async fetchEntryContent(entryId: number): Promise<{ content: string }> {
    const response = await this.client!.get(`/entries/${entryId}/fetch-content`);
    return response.data;
  }
}

export const miniflux = new MinifluxClient();
