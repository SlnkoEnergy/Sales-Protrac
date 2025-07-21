"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createHandover } from "@/services/leads/LeadService";

interface HandoverFormData {
  id: string;
  customer_details: {
    name: string;
    customer: string;
    epc_developer: string;
    site_address: {
      village_name: string;
      district_name: string;
    };
    number: string;
    p_group: string;
    state: string;
    alt_number: string;
  };
  order_details: {
    type_business: string;
  };
  project_detail: {
    project_type: string;
    module_type: string;
    module_category: string;
    evacuation_voltage: string;
    work_by_slnko: string;
    liaisoning_net_metering: string;
    ceig_ceg: string;
    proposed_dc_capacity: string;
    distance: string;
    overloading: string;
    project_kwp: string;
    project_component: string;
    project_component_other: string;
    transmission_scope: string;
    loan_scope: string;
  };
  commercial_details: {
    type: string;
  };

  other_details: {
    cam_member_name: string;
    service: string;
    slnko_basic: string;
    project_status: "incomplete";
    remark: string;
    remarks_for_slnko: string;
    submitted_by_BD: string;
  };
  submitted_by: string;
}

export default function HandoverForm() {
  const [formData, setFormData] = useState({
    id: "",
    customer_details: {
      name: "",
      customer: "",
      epc_developer: "",
      site_address: {
        village_name: "",
        district_name: "",
      },
      number: "",
      p_group: "",
      state: "",
      alt_number: "",
    },
    
    order_details: {
      type_business: "",
    },
    
    project_detail: {
      project_type: "",
      module_type: "",
      module_category: "",
      evacuation_voltage: "",
      work_by_slnko: "",
      liaisoning_net_metering: "",
      ceig_ceg: "",
      proposed_dc_capacity: "",
      distance: "",
      overloading: "",
      project_kwp: "",
      project_component: "",
      project_component_other: "",
      transmission_scope: "",
      loan_scope: "",
    },
    
    commercial_details: {
      type: "",
    },
    
    other_details: {
      service: "",
      slnko_basic: "",
      remark: "",
      remarks_for_slnko: "",
      submitted_by_BD: "",
    },
    submitted_by: "",
  });
  
  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  const keys = name.split(".");

  setFormData((prev) => {
    const updated = { ...prev };

    if (keys.length === 2) {
      const [parent, child] = keys;
      updated[parent] = {
        ...updated[parent],
        [child]: value,
      };
    } else {
      updated[name] = value;
    }

    return updated;
  });
};

  
  const handleSelectChange = (field: keyof HandoverFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const {
        id,
        customer_details,
        order_details,
        project_detail,
        commercial_details,
        other_details,
        submitted_by,
      } = formData;
  
      const payload = {
        id,
        customer_details,
        order_details,
        project_detail,
        commercial_details,
        other_details,
        invoice_detail: {}, 
        submitted_by,
        status_of_handoversheet: "draft",
        is_locked: "locked",
      };
  
      const response = await createHandover(
        payload.id,
        payload.customer_details,
        payload.order_details,
        payload.project_detail,
        payload.commercial_details,
        payload.other_details,
        payload.invoice_detail,
        payload.submitted_by,
        payload.status_of_handoversheet,
        payload.is_locked
      );
  
      toast.success("Success:", response);
    } catch (error: any) {
      console.log(error.message);
      toast.error("Submission failed:", error.message);
    }
  };
  
  return (
    <Card className="w-full max-w-5xl mx-auto ">
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
                { name: "customer_details.customer", label: "Contact Person" },
                { name: "customer_details.name", label: "Project Name" },
                { name: "customer_details.p_group", label: "Group Name" },
                { name: "customer_details.state", label: "State" },
                {
                  name: "site_address.district_name",
                  label: "Site/Delivery Address with Pin Code",
                },
                { name: "customer_details.number", label: "Contact Number" },
                {
                  name: "customer_details.alt_number",
                  label: "Alt Contact Number",
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

              <div>
                <label
                  htmlFor="epc_developer"
                  className="block mb-1 text-sm font-medium"
                >
                  EPC / Developer
                </label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("customer_details.epc_developer", value)
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
                {
                  name: "project_detail.project_type",
                  label: "Project Type",
                  options: ["On-Grid", "Off-Grid", "Hybrid"],
                },
                {
                  name: "project_detail.project_kwp",
                  label: "Proposed AC Capacity (kW)",
                },
                {
                  name: "project_detail.overloading",
                  label: "DC Overloading (%)",
                },
                {
                  name: "project_detail.proposed_dc_capacity",
                  label: "Proposed DC Capacity (kWp)",
                },
                {
                  name: "project_detail.distance",
                  label: "Transmission Line Length (KM) *",
                },
                {
                  name: "other_details.slnko_basic",
                  label: "Slnko Service Charges (Without GST)/W",
                },
                {
                  name: "other_details.service",
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
                  name: "order_details.type_business",
                  label: "Type of Business *",
                  options: ["KUSUM", "Government", "Prebid", "Others"],
                },
                {
                  name: "project_details.project_component",
                  label: "Project Component",
                  options: ["Kusum A", "Kusum C", "Kusum C2", "Other"],
                },
                {
                  name: "commercial_details.type",
                  label: "Type",
                  options: ["CapEx", "Resco", "OpEx", "Retainership"],
                },

                {
                  name: "project_details.work_by_slnko",
                  label: "Work By Slnko *",
                  options: ["ENG", "EPCM", "PMC", "EP", "ALL"],
                },
                {
                  name: "project_details.module_type",
                  label: "Module Type",
                  options: ["N-Type", "P-Type", "Thin-Film"],
                },
                {
                  name: "project_details.module_category",
                  label: "Module Content Category",
                  options: ["DCR", "Non-DCR"],
                },
                {
                  name: "project_details.loan_scope",
                  label: "Loan Scope",
                  options: ["Slnko", "Client", "TBD"],
                },
                {
                  name: "project_details.liaisoning_net_metering",
                  label: "Liaisoning for Net-Metering *",
                  options: ["Yes", "No"],
                },
                {
                  name: "project_details.ceig_ceg",
                  label: "CEIG/CEG Scope *",
                  options: ["Yes", "No"],
                },
                {
                  name: "project_details.transmission_scope",
                  label: "Transmission Line Scope *",
                  options: ["Yes", "No"],
                },
                {
                  name: "project_details.evacuation_voltage",
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
                  id="other_details.remarks_for_slnko"
                  name="other_details.remarks_for_slnko"
                  placeholder="Remarks for Slnko Service Charge *"
                  rows={2}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="other_details.remark"
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
