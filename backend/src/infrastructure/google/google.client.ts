import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleClient {
  private readonly logger = new Logger(GoogleClient.name);
  private readonly apiKey = process.env.GOOGLE_PLACES_KEY;

  async search(text: string) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    
    const response = await axios.get(url, {
      params: { query: text, key: this.apiKey },
      headers: { 'User-Agent': 'BirminghamAggregator/1.0' }
    });

    this.logger.log(`Fetched ${response.data.results.length} places`);
    return response.data;
  }

  async getDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;

    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        key: this.apiKey,
        fields: 'website,menu'
      }
    });

    return response.data;
  }
}
