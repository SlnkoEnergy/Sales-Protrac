"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  createHandover,
  editHandover,
  getHandoverByLeadId,
  getLeadbyId,
} from "@/services/leads/LeadService";
import { File, User2, Workflow } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/services/context/AuthContext";

type HandoverFormRef = {
  submit: () => void;
  resetForm: () => void;
};

const defaultInitialValues = {
  id: "",
  customer_details: {
    name: "",
    customer: "",
    epc_developer: "",
    site_address: {
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
};

export interface FormDataType {
  id: string;
  customer_details: {
    name: string;
    customer: string;
    epc_developer: string;
    site_address: {
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
    service: string;
    slnko_basic: string;
    remark: string;
    remarks_for_slnko: string;
    submitted_by_BD: string;
  };
  submitted_by: string;
}

const HandoverForm = forwardRef<HandoverFormRef>((props, ref) => {
  const [data, setData] = useState();
  const [searchParams] = useSearchParams();
  const [initialFormData, setInitialFormData] =
    useState<FormDataType>(defaultInitialValues);
  const [handover, setHandover] = useState();
  const id = searchParams.get("id");

  const {user} = useAuth();

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(),
    resetForm: () => {
      setFormData(initialFormData);
    },
    getStatus: () => handover?.is_locked,
    updated: () => handover?.status_of_handoversheet,
    update: () => handleEdit(),
  }));

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = {
          id: id,
        };
        const res = await getLeadbyId(params);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchLeads();
  }, [id]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = {
          leadId: data?.id,
        };
        const res = await getHandoverByLeadId(params);
        setHandover(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchLeads();
  }, [data]);


  const [formData, setFormData] = useState({
    id: "",
    customer_details: {
      name: "",
      customer: "",
      epc_developer: "",
      site_address: {
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

  useEffect(() => {
    if (!data) return;

    const isLocked = handover?.is_locked === "locked";

    if (isLocked && handover) {
      const updated = {
        ...handover,
        other_details: {
          ...defaultInitialValues.other_details,
          ...handover.other_details,
        },
      };

      setFormData(updated);
      setInitialFormData(updated);
    } else {
      const updatedCustomerDetails = {
        ...defaultInitialValues.customer_details,
        customer: data?.name,
        state: data?.address?.state || "",
        p_group: data?.group_name || "",
        number: data?.contact_details?.mobile?.[0] || "",
        alt_number: data?.contact_details?.mobile?.[1] || "",
      };

      const updated = {
        ...defaultInitialValues,
        id: data?.id,
        customer_details: updatedCustomerDetails,
      };

      setFormData(updated);
      setInitialFormData(updated);
    }
  }, [data, handover]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    setFormData((prev) => {
      const updated = { ...prev };

      if (keys.length === 2) {
        const [parent, child] = keys;
        const prevNested = updated[parent] || {};
        const newNested = { ...prevNested, [child]: value };

        updated[parent] = newNested;

        // ✅ 1. Calculate Proposed DC Capacity
        if (
          parent === "project_detail" &&
          (child === "project_kwp" || child === "overloading")
        ) {
          const kwp = parseFloat(
            child === "project_kwp" ? value : newNested.project_kwp || "0"
          );
          const overloading = parseFloat(
            child === "overloading" ? value : newNested.overloading || "0"
          );

          if (!isNaN(kwp) && !isNaN(overloading)) {
            newNested.proposed_dc_capacity = (
              kwp *
              (1 + overloading / 100)
            ).toFixed(2);
          }
        }

        // ✅ 2. Calculate Total Slnko Service Charges (Without GST)
        if (
          (parent === "project_detail" && child === "project_kwp") ||
          (parent === "other_details" && child === "slnko_basic")
        ) {
          const kwp =
            parent === "project_detail"
              ? parseFloat(value)
              : parseFloat(updated.project_detail?.project_kwp || "0");
          const slnko =
            parent === "other_details"
              ? parseFloat(value)
              : parseFloat(updated.other_details?.slnko_basic || "0");

          if (!isNaN(kwp) && !isNaN(slnko)) {
            const total = kwp * 1000 * slnko;
            updated.other_details = {
              ...updated.other_details,
              service: total.toFixed(2),
            };
          }
        }
      } else {
        updated[name] = value;
      }

      return updated;
    });
  };

  const handleSelectChange = (path: string, value: string) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const updated = { ...prev };
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const requiredFields = [
      { name: "order_details.type_business", label: "Type of Business *" },
      { name: "project_detail.work_by_slnko", label: "Work By Slnko *" },
      {
        name: "project_detail.liaisoning_net_metering",
        label: "Liaisoning for Net-Metering *",
      },
      { name: "project_detail.ceig_ceg", label: "CEIG/CEG Scope *" },
      {
        name: "project_detail.transmission_scope",
        label: "Transmission Line Scope *",
      },
      {
        name: "project_detail.evacuation_voltage",
        label: "Evacuation Voltage *",
      },
      {
        name: "other_details.remarks_for_slnko",
        label: "Remarks for Slnko Service Charge *",
      },
      {
        name: "other_details.remark",
        label: "Remarks (Any Other Commitments to Client) *",
      },
      {
        name: "project_detail.distance",
        label: "Transmission Line Length (KM) *",
      },
      {
        name: "other_details.service",
        label: "Total Slnko Service Charges (Without GST) *",
      },
    ];

    const newErrors: Record<string, string> = {};

    requiredFields.forEach(({ name, label }) => {
      const value = getValueByPath(formData, name);
      if (!value) {
        newErrors[name] = `${label.replace(" *", "")} is required.`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join("\n");
      toast.error(errorMessages, { duration: 5000 });
      return;
    }

    try {
      const {
        id,
        customer_details,
        order_details,
        project_detail,
        commercial_details,
        other_details: originalOtherDetails,
      } = formData;

      const users = user;

      const other_details = {
        ...originalOtherDetails,
        submitted_by_BD: users?.name || "",
      };

      const payload = {
        id,
        customer_details,
        order_details,
        project_detail,
        commercial_details,
        other_details,
        invoice_detail: {},
        submitted_by: users?.name || "",
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

      toast.success("Handover Sheet Submitted Successfully");
      setTimeout(() => {
        location.reload();
      }, 300);
    } catch (error: any) {
      toast.error("Error in Submitting Handover Sheet");
    }
  };

  const handleEdit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      const {
        id,
        customer_details,
        order_details,
        project_detail,
        commercial_details,
        other_details,
        submitted_by: name,
      } = formData;

      const payload = {
        id,
        customer_details,
        order_details,
        project_detail,
        commercial_details,
        other_details,
        invoice_detail: {},
        submitted_by: name,
        status_of_handoversheet: "draft",
        is_locked: "locked",
      };

      const response = await editHandover(handover?._id, payload);
      toast.success("Handover Sheet Updated Successfully");

      setTimeout(() => {
        location.reload();
      }, 300);
    } catch (error: any) {
      toast.error(error.message || "Error in Updating Handover Sheet");
    }
  };

  const getValueByPath = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  return (
    <div className="max-h-screen">
      <Card className="w-full  max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex gap-2 items-center text-[#214b7b]">
            {" "}
            <File size={20} /> Handover Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={
              handover?.status_of_handoversheet === "Rejected"
                ? handleEdit
                : handleSubmit
            }
            className="space-y-6"
          >
            {/* CLIENT INFO */}
            <div>
              <h2 className="text-lg font-semibold flex gap-2 items-center">
                <User2 size={18} /> Client Info
              </h2>
              <span className="text-sm text-gray-500 font-semibold">
                Enter all the Client Details
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
                  {
                    name: "customer_details.customer",
                    label: "Contact Person",
                  },
                  { name: "customer_details.name", label: "Project Name" },
                  { name: "customer_details.p_group", label: "Group Name" },
                  { name: "customer_details.state", label: "State" },
                  {
                    name: "customer_details.site_address.district_name",
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

                    {name === "customer_details.state" ? (
                      <Select
                        value={getValueByPath(formData, name) || ""}
                        onValueChange={(value) =>
                          handleSelectChange(name, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent
                          className="w-full max-h-48 overflow-y-auto z-50"
                          side="bottom"
                          position="popper"
                        >
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={name}
                        name={name}
                        placeholder={label}
                        value={getValueByPath(formData, name) || ""}
                        onChange={(e) =>
                          handleSelectChange(name, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="customer_details.epc_developer"
                    className="block mb-1 text-sm font-medium"
                  >
                    EPC / Developer
                  </label>
                  <Select
                    value={
                      getValueByPath(
                        formData,
                        "customer_details.epc_developer"
                      ) || ""
                    }
                    onValueChange={(value) =>
                      handleSelectChange(
                        "customer_details.epc_developer",
                        value
                      )
                    }
                  >
                    <SelectTrigger
                      id="epc_developer"
                      className="data-[placeholder]:text-gray-600"
                    >
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
              <h2 className="text-lg font-semibold flex gap-2 items-center">
                <Workflow size={18} /> Project Info
              </h2>
              <span className="text-sm text-gray-500 font-semibold">
                Enter all the Project Details
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {[
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
                    readOnly: true,
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
                ].map(({ name, label, readOnly }) => (
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
                      value={getValueByPath(formData, name) || ""}
                      readOnly={readOnly}
                      onChange={handleChange}
                    />
                  </div>
                ))}

               {[
  {
    name: "project_detail.project_type",
    label: "Project Type",
    options: ["On-Grid", "Off-Grid", "Hybrid"],
  },
  {
    name: "order_details.type_business",
    label: "Type of Business *",
    options: ["Kusum", "Government", "Prebid", "Others"],
  },
  {
    name: "project_detail.project_component",
    label: "Project Component",
    options: [
      { label: "Kusum A", value: "KA" },
      { label: "Kusum C", value: "KC" },
      { label: "Kusum C2", value: "KC2" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    name: "commercial_details.type",
    label: "Type",
    options: ["CapEx", "Resco", "OpEx", "Retainership"],
  },
  {
    name: "project_detail.work_by_slnko",
    label: "Work By Slnko *",
    options: ["ENG", "EPMC", "PMC", "EP", "ALL"],
  },
  {
    name: "project_detail.module_type",
    label: "Module Type",
    options: ["N-TYPE", "P-TYPE", "Thin-Film"],
  },
  {
    name: "project_detail.module_category",
    label: "Module Content Category",
    options: ["DCR", "Non DCR"],
  },
  {
    name: "project_detail.loan_scope",
    label: "Loan Scope",
    options: ["Slnko", "Client", "TBD"],
  },
  {
    name: "project_detail.liaisoning_net_metering",
    label: "Liaisoning for Net-Metering *",
    options: ["Yes", "No"],
  },
  {
    name: "project_detail.ceig_ceg",
    label: "CEIG/CEG Scope *",
    options: ["Yes", "No"],
  },
  {
    name: "project_detail.transmission_scope",
    label: "Transmission Line Scope *",
    options: ["Yes", "No"],
  },
  {
    name: "project_detail.evacuation_voltage",
    label: "Evacuation Voltage *",
    options: ["11 KV", "33 KV"],
  },
].map(({ name, label, options }) => (
  <div key={name}>
    <label htmlFor={name} className="block mb-1 text-sm font-medium">
      {label}
    </label>

    <Select
      value={getValueByPath(formData, name) || ""}
      onValueChange={(value) => handleSelectChange(name, value)}
    >
      <SelectTrigger
        id={name}
        className="data-[placeholder]:text-gray-600"
      >
        <SelectValue placeholder={label}>
          {(() => {
            const selectedValue = getValueByPath(formData, name);
            const matchedOption = options.find((opt) =>
              typeof opt === "string"
                ? opt === selectedValue
                : opt.value === selectedValue
            );
            return typeof matchedOption === "string"
              ? matchedOption
              : matchedOption?.label || label;
          })()}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {options.map((opt) => {
          const value = typeof opt === "string" ? opt : opt.value;
          const labelText = typeof opt === "string" ? opt : opt.label;
          return (
            <SelectItem key={value} value={value}>
              {labelText}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  </div>
))}


                <div className="md:col-span-2">
                  <label
                    htmlFor="other_details.remarks_for_slnko"
                    className="block mb-1 text-sm font-medium"
                  >
                    Remarks for Slnko Service Charge *
                  </label>
                  <Textarea
                    id="other_details.remarks_for_slnko"
                    name="other_details.remarks_for_slnko"
                    placeholder="Remarks for Slnko Service Charge *"
                    rows={2}
                    value={formData.other_details.remarks_for_slnko}
                    onChange={handleChange}
                    required
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
                    id="other_details.remark"
                    name="other_details.remark"
                    placeholder="Remarks (Any Other Commitments to Client) *"
                    rows={2}
                    value={formData.other_details.remark}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});
export default HandoverForm;
