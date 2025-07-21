"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface HandoverFormData {
  contactPerson: string;
  projectName: string;
  groupName: string;
  state: string;
  address: string;
  number: string;
  alt_number: string;
  epc_developer: string;
  businessType: string;
  projectComponent: string;
  type: string;
  project_type: string;
  acCapacity: string;
  dcOverloading: string;
  dcCapacity: string;
  workBySlnko: string;
  moduleType: string;
  netMetering: string;
  ceigScope: string;
  transmissionScope: string;
  transmissionLength: string;
  evacuationVoltage: string;
  loanScope: string;
  moduleCategory: string;
  moduleContent:string;
  serviceChargesPerWatt: string;
  totalServiceCharges: string;
  remarksServiceCharge: string;
  otherRemarks: string;
  slnkoServiceCharge:string;
}

export default function HandoverForm() {
  const [formData, setFormData] = useState<HandoverFormData>({
    contactPerson: "",
    projectName: "",
    groupName: "",
    state: "",
    address: "",
    number: "",
    alt_number: "",
    epc_developer: "",
    businessType: "",
    projectComponent: "",
    type: "",
    project_type: "",
    acCapacity: "",
    dcOverloading: "",
    dcCapacity: "",
    workBySlnko: "",
    moduleType: "",
    netMetering: "",
    ceigScope: "",
    moduleContent:"",
    transmissionScope: "",
    transmissionLength: "",
    evacuationVoltage: "",
    loanScope: "",
    moduleCategory: "",
    serviceChargesPerWatt: "",
    totalServiceCharges: "",
    remarksServiceCharge: "",
    slnkoServiceCharge:"",
    otherRemarks: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (field: keyof HandoverFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Handover form submitted!");
    console.log("Submitted:", formData);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto p-4">
      <CardHeader>
        <CardTitle className="text-xl">Handover Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CLIENT INFO */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Client Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "contactPerson", label: "Contact Person" },
                { name: "projectName", label: "Project Name" },
                { name: "groupName", label: "Group Name" },
                { name: "state", label: "State" },
                {
                  name: "address",
                  label: "Site/Delivery Address with Pin Code",
                },
                { name: "number", label: "Contact Number" },
                { name: "alt_number", label: "Alt Contact Number" },
                {name:"slnkoServiceCharge",label:"Slnko Service Charges (Without GST)/W"},
                {name:"totalSlnkoServiceCharge",label:"Total Slnko Service Charges (Without GST) *"},
              ].map(({ name, label }) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="block mb-1 text-sm font-medium"
                  >
                    {label}
                  </label>
                  <Input
                    id={name}
                    name={name}
                    placeholder={label}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="epc_developer"
                  className="block mb-1 text-sm font-medium"
                >
                  EPC / Developer
                </label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("epc_developer", value)
                  }
                >
                  <SelectTrigger id="epc_developer">
                    <SelectValue placeholder="EPC / Developer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EPC">EPC</SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* PROJECT INFO */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Project Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                
                { name: "project_type", label: "Project Type" },
                { name: "acCapacity", label: "Proposed AC Capacity (kW)" },
                { name: "dcOverloading", label: "DC Overloading (%)" },
                { name: "dcCapacity", label: "Proposed DC Capacity (kWp)" },
                {
                  name: "transmissionLength",
                  label: "Transmission Line Length (KM) *",
                },
                { name: "moduleCategory", label: "Module Content Category *" },
                {
                  name: "serviceChargesPerWatt",
                  label: "Slnko Service Charges (Without GST)/W *",
                },
                {
                  name: "totalServiceCharges",
                  label: "Total Slnko Service Charges (Without GST) *",
                },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="block mb-1 text-sm font-medium"
                  >
                    {label}
                  </label>
                  <Input
                    id={name}
                    name={name}
                    placeholder={label}
                    onChange={handleChange}
                  />
                </div>
              ))}

              {[
                 {
                  name: "businessType",
                  label: "Type of Business *",
                  options: ["a", "b", "c", "d"],
                },
                {
                  name:"projectComponent",
                  label:"Project Component",
                  options:["a","b"]
                },
                {
                  name:"type",
                  label:"Type",
                  options:["a","b"]
                },
                {
                  name: "workBySlnko",
                  label: "Work By Slnko *",
                  options: ["ENG", "EPCM", "PMC", "EP", "ALL"],
                },
                {
                  name:"moduleType",
                  label:"Module Type",
                  options: ["N-Type", "P-Type", "Thin-Film"]
                },
                {
                  name:"moduleContent",
                  label:"Module Content Category",
                  options:["DCR","Non-DCR"]
                },
                {
                  name:"loanScope",
                  label:"Loan Scope",
                  options:["Slnko","Client","TBD"]
                },
                {
                  name: "netMetering",
                  label: "Liaisoning for Net-Metering *",
                  options: ["Yes", "No"],
                },
                {
                  name: "ceigScope",
                  label: "CEIG/CEG Scope *",
                  options: ["Yes", "No"],
                },
                {
                  name: "transmissionScope",
                  label: "Transmission Line Scope *",
                  options: ["Yes", "No"],
                },
                {
                  name: "evacuationVoltage",
                  label: "Evacuation Voltage *",
                  options: ["11kV", "33kV"],
                },
                
               
                
              ].map(({ name, label, options }) => (
                <div key={name}>
                  <label
                    htmlFor={name}
                    className="block mb-1 text-sm font-medium"
                  >
                    {label}
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange(name as keyof HandoverFormData, value)
                    }
                  >
                    <SelectTrigger id={name}>
                      <SelectValue placeholder={label} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <div className="md:col-span-2">
                <label
                  htmlFor="remarksServiceCharge"
                  className="block mb-1 text-sm font-medium"
                >
                  Remarks for Slnko Service Charge *
                </label>
                <Textarea
                  id="remarksServiceCharge"
                  name="remarksServiceCharge"
                  placeholder="Remarks for Slnko Service Charge *"
                  rows={2}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="otherRemarks"
                  className="block mb-1 text-sm font-medium"
                >
                  Remarks (Any Other Commitments to Client) *
                </label>
                <Textarea
                  id="otherRemarks"
                  name="otherRemarks"
                  placeholder="Remarks (Any Other Commitments to Client) *"
                  rows={2}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
