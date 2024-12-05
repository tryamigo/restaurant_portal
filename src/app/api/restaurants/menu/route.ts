import { handleRequest } from "@/components/helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;

  try {
    return await handleRequest(req, 'GET', `/restaurants/${params.id}/menu`);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  try {
    const body = await req.json();
    return await handleRequest(req, 'POST', `/restaurants/${params.id}/menu`, body);
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json({ error: 'Failed to add menu item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    const body = await req.json();
    return await handleRequest(req, 'PUT', `/restaurants/${params.id}/menu/${id}`, body);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest,context: { params: { id: string} }) {
  const params = await context.params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {

    return await handleRequest(req, 'DELETE', `/restaurants/${params.id}/menu/${id}`);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}