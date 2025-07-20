"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function HandoverForm() {
  const [formData, setFormData] = useState({
    contactPerson: "",
    projectName: "",
    groupName: "",
    state: "",
    contactNumber: "",
    altContactNumber: "",
    address: "",
    pincode: "",
    businessType: "",
    otherBusinessType: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusinessTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessType: value,
      otherBusinessType: value === "Others" ? prev.otherBusinessType : "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "contactPerson",
      "projectName",
      "groupName",
      "state",
      "contactNumber",
      "address",
      "pincode",
      "businessType",
    ];

    const isEmptyField = requiredFields.some((field) => !formData[field as keyof typeof formData]);

    if (isEmptyField) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.businessType === "Others" && !formData.otherBusinessType) {
      toast.error("Please specify the business type");
      return;
    }

    toast.success("Handover details submitted");
    console.log("Handover Form Data:", formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Handover Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Client Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contact Person *</Label>
              <Input name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
            </div>
            <div>
              <Label>Project Name *</Label>
              <Input name="projectName" value={formData.projectName} onChange={handleChange} />
            </div>
            <div>
              <Label>Group Name *</Label>
              <Input name="groupName" value={formData.groupName} onChange={handleChange} />
            </div>
            <div>
              <Label>State *</Label>
              <Input name="state" value={formData.state} onChange={handleChange} />
            </div>
            <div>
              <Label>Contact Number *</Label>
              <Input name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
            </div>
            <div>
              <Label>Alt Contact Number</Label>
              <Input name="altContactNumber" value={formData.altContactNumber} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <Label>Site / Delivery Address *</Label>
              <Textarea name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div>
              <Label>Pincode *</Label>
              <Input name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-2">
            <Label>Type of Business *</Label>
            <Select value={formData.businessType} onValueChange={handleBusinessTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kusum">Kusum</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Prebid">Prebid</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
            {formData.businessType === "Others" && (
              <div>
                <Label>Please specify *</Label>
                <Input
                  name="otherBusinessType"
                  value={formData.otherBusinessType}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
