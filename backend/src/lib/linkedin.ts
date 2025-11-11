import axios from 'axios';

interface LinkedInTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface LinkedInApiResponse<T> {
  elements?: T[];
  data?: T;
}

export class LinkedInClient {
  private readonly baseUrl = 'https://api.linkedin.com/v2';
  private readonly formBaseUrl = 'https://api.linkedin.com/v2/adForms';

  constructor() {
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
      throw new Error('LinkedIn client configuration missing');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await axios.post<LinkedInTokenResponse>(
      'https://www.linkedin.com/oauth/v2/accessToken', 
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  }

  async getLeadGenForms(accessToken: string): Promise<any[]> {
    const response = await axios.get<LinkedInApiResponse<any>>(`${this.formBaseUrl}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.elements || [];
  }

  async getFormResponses(accessToken: string, formId: string): Promise<any[]> {
    const response = await axios.get<LinkedInApiResponse<any>>(`${this.formBaseUrl}/${formId}/submissions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.elements || [];
  }

  async getProfile(accessToken: string): Promise<any> {
    const response = await axios.get<LinkedInApiResponse<any>>(`${this.baseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  }

  async getCompany(accessToken: string, companyId: string): Promise<any> {
    const response = await axios.get<LinkedInApiResponse<any>>(`${this.baseUrl}/organizations/${companyId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.data;
  }
}