import { handleRequest } from "@/components/helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  const { restaurantId } = params;
  const { searchParams } = new URL(request.url);
  const lastChecked = searchParams.get('lastChecked');

  try {
    return await handleRequest(
      request,
      'GET',
      `/orders/restaurant/${restaurantId}/new?lastChecked=${lastChecked}`
    );
  } catch (error) {
    console.error('Error fetching new orders:', error);
    return NextResponse.json({ error: 'Failed to fetch new orders' }, { status: 500 });
  }
}