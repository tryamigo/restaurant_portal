// app/(restaurant)/coupons/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { Coupon } from '@/components/types';

const CouponsPage = () => {
  const { data: session, status } = useSession();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    couponCode: '',
    usageLimit: 0,
    startDate: '',
    endDate: '',
  });
  const [searchCode, setSearchCode] = useState('');
  const [foundCoupon, setFoundCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if(status === 'authenticated'){
        fetchCoupons();
    }
  }, [session, status]);
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchCode) {
        handleFindCouponByCode(searchCode);
      }
      else{
        setFoundCoupon(null);
      }
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchCode]);
  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/restaurants/coupons', {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch coupons');
      const data = await response.json();
      setCoupons(data.coupons);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/restaurants/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify({
          ...newCoupon,
          restaurantId: session?.user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add coupon');
      
      toast({
        title: "Success",
        description: "Coupon added successfully",
      });
      
      fetchCoupons();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add coupon",
        variant: "destructive",
      });
    } finally {
      setNewCoupon({
        title: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        couponCode: '',
        usageLimit: 0,
        startDate: '',
        endDate: '',
      });
      setIsAddingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const response = await fetch(`/api/restaurants/coupons?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete coupon');
      
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      
      fetchCoupons();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCouponStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/restaurants/coupons?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error('Failed to update coupon status');
      
      toast({
        title: "Success",
        description: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchCoupons();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon status",
        variant: "destructive",
      });
    }
  };

  const handleFindCouponByCode = async (code: string) => {
    try {
      const response = await fetch(`/api/restaurants/coupons?code=${code}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to find coupon');
      
      const data = await response.json();
      if (data.coupon) {
        setFoundCoupon(data.coupon);
        toast({
          title: "Success",
          description: "Coupon found",
        });
      } else {
        setFoundCoupon(null);
        toast({
          title: "Info",
          description: "No coupon found with this code",
        });
      }
  
    } catch (error) {
      console.error('Error:', error);
      setFoundCoupon(null);
      toast({
        title: "Error",
        description: "Failed to find coupon",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Restaurant Coupons</CardTitle>
          <Button onClick={() => setIsAddingCoupon(!isAddingCoupon)}>
            {isAddingCoupon ? 'Cancel' : 'Add New Coupon'}
          </Button>
        </CardHeader>
        <CardContent>
          {isAddingCoupon && (
            <form onSubmit={handleAddCoupon} className="space-y-4 mb-6"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="space-y-2"> <Label htmlFor="title">Title</Label> <Input id="title" value={newCoupon.title || ''} onChange={(e) => setNewCoupon({...newCoupon, title: e.target.value})} required /> </div> <div className="space-y-2"> <Label htmlFor="description">Description</Label> <Input id="description" value={newCoupon.description || ''} onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})} /> </div> <div className="space-y-2"> <Label htmlFor="discountType">Discount Type</Label> <Select onValueChange={(value) => setNewCoupon({...newCoupon, discountType: value as 'PERCENTAGE' | 'FIXED_AMOUNT'} )} > <SelectTrigger> <SelectValue placeholder="Select discount type" /> </SelectTrigger> <SelectContent> <SelectItem value="PERCENTAGE">Percentage</SelectItem> <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem> </SelectContent> </Select> </div> <div className="space-y-2"> <Label htmlFor="discountValue">Discount Value</Label> <Input type="number" id="discountValue" value={newCoupon.discountValue || ''} onChange={(e) => setNewCoupon({...newCoupon, discountValue: Number(e.target.value)})} required /> </div> <div className="space-y-2"> <Label htmlFor="minOrderValue">Minimum Order Value</Label> <Input type="number" id="minOrderValue" value={newCoupon.minOrderValue || ''} onChange={(e) => setNewCoupon({...newCoupon, minOrderValue: Number(e.target.value)})} /> </div> <div className="space-y-2"> <Label htmlFor="maxDiscount">Maximum Discount</Label> <Input type="number" id="maxDiscount" value={newCoupon.maxDiscount || ''} onChange={(e) => setNewCoupon({...newCoupon, maxDiscount: Number(e.target.value)})} /> </div> <div className="space-y-2"> <Label htmlFor="couponCode">Coupon Code</Label> <Input id="couponCode" value={newCoupon.couponCode || ''} onChange={(e) => setNewCoupon({...newCoupon, couponCode: e.target.value})} /> </div> <div className="space-y-2"> <Label htmlFor="usageLimit">Usage Limit</Label> <Input type="number" id="usageLimit" value={newCoupon.usageLimit || ''} onChange={(e) => setNewCoupon({...newCoupon, usageLimit: Number(e.target.value)})} /> </div> <div className="space-y-2"> <Label htmlFor="startDate">Start Date</Label> <Input type="date" id="startDate" value={newCoupon.startDate || ''} onChange={(e) => setNewCoupon({...newCoupon, startDate: e.target.value})} required /> </div> <div className="space-y-2"> <Label htmlFor="endDate">End Date</Label> <Input type="date" id="endDate" value={newCoupon.endDate || ''} onChange={(e) => setNewCoupon({...newCoupon, endDate: e.target.value})} required /> </div> </div> <Button type="submit">Add Coupon</Button> </form>
          )}
          <div>
            {coupons.length > 0 ? (
              <ul>
                {coupons.map((coupon) => (
                  <li key={coupon.id} className="flex justify-between items-center py-2">
                    <div>
                    <p className="font-semibold">Coupon Code:{coupon.couponCode}</p>
                      <h4 className="font-semibold">{coupon.title}</h4>
                      <p>{coupon.description}</p>
                      <Badge variant={coupon.isActive ? 'default' : 'destructive'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="destructive" onClick={() => handleDeleteCoupon(coupon.id)}>
                        Delete
                      </Button>
                      <Button onClick={() => handleUpdateCouponStatus(coupon.id, !coupon.isActive)}>
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No coupons available.</p>
            )}
          </div>
          <div className="mt-4">
            <Input
              placeholder="Enter coupon code to find"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
             {foundCoupon && (
              <Card className="p-4 bg-gray-100 mt-4">
                <h3 className="font-bold text-lg mb-2">Found Coupon</h3>
                <p><strong>Code:</strong> {foundCoupon.couponCode}</p>
                <p><strong>Title:</strong> {foundCoupon.title}</p>
                <p><strong>Description:</strong> {foundCoupon.description}</p>
                <p><strong>Discount:</strong> {foundCoupon.discountType === 'PERCENTAGE' ? `${foundCoupon.discountValue}%` : `$${foundCoupon.discountValue}`}</p>
                <p><strong>Status:</strong> {foundCoupon.isActive ? 'Active' : 'Inactive'}</p>
                <div className="mt-2">
                  <Button variant="destructive" onClick={() => handleDeleteCoupon(foundCoupon.id)}>
                    Delete
                  </Button>
                  <Button className="ml-2" onClick={() => handleUpdateCouponStatus(foundCoupon.id, !foundCoupon.isActive)}>
                    {foundCoupon.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Card>
            )}
             {searchCode && !foundCoupon && (
        <p className="mt-2 text-gray-600">No coupon found with this code.</p>
      )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponsPage;