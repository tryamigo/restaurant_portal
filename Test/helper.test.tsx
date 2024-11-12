// Test/helper.test.tsx
import { NextRequest } from 'next/server';
import axios from 'axios';
import { handleRequest } from '@/components/helper';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation(() => ({
    headers: {
      get: jest.fn().mockReturnValue('Bearer mockToken123'), // mock token header
    },
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, { status }) => ({ json: () => data, status })),
  },
}));

describe('handleRequest', () => {
  const mockUrl = '/test';
  const mockToken = 'mockToken123';
  const mockData = { key: 'value' };
  const mockParams = { paramKey: 'paramValue' };

  const createMockRequest = (token?: string): NextRequest => {
    return {
      headers: {
        get: (header: string) => (header === 'Authorization' && token ? `Bearer ${token}` : null),
      },
    } as unknown as NextRequest;
  };

  it('returns 401 if no token is provided', async () => {
    const req = createMockRequest();

    const response = await handleRequest(req, 'GET', mockUrl);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized: No token provided' });
  });

  it('returns 401 if token is invalid or expired', async () => {
    const req = createMockRequest(mockToken);
    mockedAxios.request.mockRejectedValue({
      response: { status: 401, data: { error: 'Unauthorized: Invalid or expired token' } },
    });

    const response = await handleRequest(req, 'GET', mockUrl);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized: Invalid or expired token' });
  });

  it('makes a successful request with valid token', async () => {
    const req = createMockRequest(mockToken);
    const mockAxiosResponse = { data: { success: true }, status: 200 };
    mockedAxios.request.mockResolvedValue(mockAxiosResponse);

    const response = await handleRequest(req, 'POST', mockUrl, mockData, mockParams);

    expect(mockedAxios.request).toHaveBeenCalledWith({
      method: 'POST',
      url: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${mockUrl}`,
      data: mockData,
      params: mockParams,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(mockAxiosResponse.data);
  });

  it('returns a 500 status if an error occurs during the request', async () => {
    const req = createMockRequest(mockToken);
    mockedAxios.request.mockRejectedValue({
      response: { status: 500, data: { error: 'Server Error' } },
    });

    const response = await handleRequest(req, 'GET', mockUrl);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Server Error' });
  });
});
