import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

export const handleRequest= async (req: NextRequest, method: string, url: string, data?: any, params?: any) =>{
    try {
      // Extract the token from the Authorization header
      const authHeader = req.headers.get('Authorization');
       const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
      }
      const response = await axios({
        method,
        url: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${url}`,
        data,
        params,
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        }
      });
 
      return NextResponse.json(response.data, { status: response.status });
    } catch (error: any) {
      console.error(`Error in ${method} request:`, error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Handle token expiration or invalid token
        return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
      }
      return NextResponse.json(
        { error: error.response?.data?.error || 'An error occurred while processing your request' },
        { status: error.response?.status || 500 }
      );
    }
  }