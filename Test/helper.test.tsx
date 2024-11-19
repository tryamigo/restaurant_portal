import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError, AxiosResponse } from 'axios';
import { handleRequest } from "@/components/helper";

// Use jest.mocked for type-safe mocking
jest.mock('axios');
// Mock NextRequest and NextResponse
jest.mock("next/server", () => {
  const headers = new Headers();
  return {
    NextRequest: class {
      headers = headers;
      url = 'https://example.com';
      method = 'GET';
      nextUrl = { pathname: '/', searchParams: new URLSearchParams() };
      cookies = { get: jest.fn() };
    },
    NextResponse: {
      json: jest.fn((data, options) => ({
        status: options?.status || 200,
        json: () => Promise.resolve(data),
      })),
    },
  };
});

describe('handleRequest', () => {
  // Helper to create a mock NextRequest
  const createMockNextRequest = (token?: string): NextRequest => {
    const mockHeaders = new Headers();
    if (token) {
      mockHeaders.set('Authorization', `Bearer ${token}`);
    }

    return {
      headers: mockHeaders,
      url: 'https://example.com',
      method: 'GET',
      nextUrl: {
        pathname: '/',
        searchParams: new URLSearchParams(),
      } as any,
      cookies: {
        get: jest.fn(),
      } as any,
    } as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_BACKEND_API_URL = 'https://api.example.com';
  });

  it('should successfully make a request with a valid token', async () => {
    const mockToken = 'valid-token';
    const mockRequest = createMockNextRequest(mockToken);
    const mockMethod = 'GET';
    const mockUrl = '/test-endpoint';
    const mockResponseData = { message: 'Success' };

    // Use jest.mocked and mock implementation
    const mockedAxios = jest.mocked(axios);
    mockedAxios.mockImplementation(() => 
      Promise.resolve({
        data: mockResponseData,
        status: 200,
      } as AxiosResponse)
    );

    const response = await handleRequest(mockRequest, mockMethod, mockUrl);

    expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
      method: mockMethod,
      url: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${mockUrl}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`,
      },
      data: undefined,
      params: undefined,
    }));

    const jsonResponse = await response.json();
    expect(response.status).toBe(200);
    expect(jsonResponse).toEqual(mockResponseData);
  });

  it('should handle 401 unauthorized error from axios', async () => {
    const mockToken = 'invalid-token';
    const mockRequest = createMockNextRequest(mockToken);
    const mockMethod = 'GET';
    const mockUrl = '/protected-resource';

    // Mock implementation for error scenario
    const mockedAxios = jest.mocked(axios);
    mockedAxios.mockImplementation(() => 
      Promise.reject({
        response: {
          status: 401,
          data: { error: 'Invalid credentials' }
        }
      } as AxiosError)
    );

    const response = await handleRequest(mockRequest, mockMethod, mockUrl);

    const jsonResponse = await response.json();
    expect(response.status).toBe(401);
    expect(jsonResponse).toEqual({ 
      error: 'Unauthorized: Invalid or expired token' 
    });
  });

  it('should return 401 when no token is provided', async () => {
    const mockRequest = createMockNextRequest();
    const mockMethod = 'GET';
    const mockUrl = '/protected-endpoint';

    const response = await handleRequest(mockRequest, mockMethod, mockUrl);

    const jsonResponse = await response.json();
    expect(response.status).toBe(401);
    expect(jsonResponse).toEqual({ 
      error: 'Unauthorized: No token provided' 
    });
  });

  it('should handle generic error from axios', async () => {
    const mockToken = 'valid-token';
    const mockRequest = createMockNextRequest(mockToken);
    const mockMethod = 'GET';
    const mockUrl = '/error-endpoint';

    // Mock implementation for generic error
    const mockedAxios = jest.mocked(axios);
    mockedAxios.mockImplementation(() => 
      Promise.reject({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      } as AxiosError)
    );

    const response = await handleRequest(mockRequest, mockMethod, mockUrl);

    const jsonResponse = await response.json();
    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({ 
      error: 'Internal Server Error' 
    });
  });

  it('should handle axios error without response', async () => {
    const mockToken = 'valid-token';
    const mockRequest = createMockNextRequest(mockToken);
    const mockMethod = 'GET';
    const mockUrl = '/network-error';

    // Mock implementation for network error
    const mockedAxios = jest.mocked(axios);
    mockedAxios.mockImplementation(() => 
      Promise.reject(new Error('Network Error'))
    );

    const response = await handleRequest(mockRequest, mockMethod, mockUrl);

    const jsonResponse = await response.json();
    expect(response.status).toBe(500);
    expect(jsonResponse).toEqual({ 
      error: 'An error occurred while processing your request' 
    });
  });
});