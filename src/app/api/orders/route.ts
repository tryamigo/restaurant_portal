import { handleRequest } from "@/components/helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const mobile = searchParams.get('mobile'); // Add this line to retrieve mobile parameter

    if (id) {
      // Get specific order by ID
      return await handleRequest(req, 'GET', `/orders/${id}`);
    } else if (mobile) {
      // Get all orders by mobile number
      return await handleRequest(req, 'GET', `/orders/mobile/${mobile}`);
    } else {
      // Get all orders
      return await handleRequest(req, 'GET', '/orders');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Create new order
    return await handleRequest(req, 'POST', '/orders', body);
  } catch (error) {
    console.error('Error with order operation:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const updateType = searchParams.get('updateType');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!updateType) {
      return NextResponse.json({ error: 'Update type is required' }, { status: 400 });
    }

    switch (updateType) {
      case 'status':
        return await handleRequest(req, 'PUT', `/orders/${orderId}/status`, body);
      case 'address':
        return await handleRequest(req, 'PUT', `/orders/${orderId}/address`, body);
      default:
        return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    return await handleRequest(req, 'DELETE', `/orders/${orderId}`);
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}