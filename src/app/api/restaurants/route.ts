// app/api/restaurants/route.ts

import { handleRequest } from "@/components/helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const menu = searchParams.get('menu');

  try {
    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    if (menu === 'true') {
      return await handleRequest(request, 'GET', `/restaurants/${id}/menu`);
    } else {
      return await handleRequest(request, 'GET', `/restaurants/${id}`);
    }
  } catch (error) {
    console.error('Error fetching restaurant or menu:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurant or menu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const menu = searchParams.get('menu');

  try {
    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    const body = await request.json();

    if (menu === 'true') {
      return await handleRequest(request, 'POST', `/restaurants/${id}/menu`, body);
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json({ error: 'Failed to add menu item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const menu = searchParams.get('menu');
  const menuItemId = searchParams.get('menuItemId');

  try {
    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    const body = await request.json();

    if (menu === 'true' && menuItemId) {
      return await handleRequest(request, 'PUT', `/restaurants/${id}/menu/${menuItemId}`, body);
    } else if (!menu) {
      return await handleRequest(request, 'PUT', `/restaurants/${id}`, body);
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating restaurant or menu item:', error);
    return NextResponse.json({ error: 'Failed to update restaurant or menu item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const menu = searchParams.get('menu');
  const menuItemId = searchParams.get('menuItemId');

  try {
    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    if (menu === 'true' && menuItemId) {
      return await handleRequest(request, 'DELETE', `/restaurants/${id}/menu/${menuItemId}`);
    } else if (!menu) {
      return await handleRequest(request, 'DELETE', `/restaurants/${id}`);
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting restaurant or menu item:', error);
    return NextResponse.json({ error: 'Failed to delete restaurant or menu item' }, { status: 500 });
  }
}