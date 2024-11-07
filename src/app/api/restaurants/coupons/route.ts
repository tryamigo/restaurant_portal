import { handleRequest } from "@/components/helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  try {
    if (code) {
      // Find coupon by code
      return await handleRequest(request, 'GET', `/coupon/restaurant/?code=${code}`);
    } else {
      // Get all active coupons
      return await handleRequest(request, 'GET', '/coupon/restaurant/active');
    }
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await handleRequest(request, 'POST', '/coupon/restaurant/add', body);
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    return await handleRequest(request, 'PUT', `/coupon/restaurant/status/${id}`, body);
  } catch (error) {
    console.error('Error updating coupon status:', error);
    return NextResponse.json({ error: 'Failed to update coupon status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
  }

  try {
    return await handleRequest(request, 'DELETE', `/coupon/restaurant/delete/${id}`);
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}