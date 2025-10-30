"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
import {
  createHandover,
  editHandover,
  getDocuments,
  getHandoverByLeadId,
  getLeadbyId,
} from "@/services/leads/LeadService";
import {
  File as FileIcon,
  User2,
  Workflow,
  Paperclip,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/services/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

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
    project_completion_date: "",
    bd_commitment_date: "",
    ppa_expiry_date: "",
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
  assigned_to: "",
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
    project_completion_date: string;
    bd_commitment_date: string;
    ppa_expiry_date: string;
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
  assigned_to: string;
}

const HandoverForm = forwardRef<HandoverFormRef>((props, ref) => {
  const [data, setData] = useState<any>();
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const [initialFormData, setInitialFormData] =
    useState<FormDataType>(defaultInitialValues);
  const [handover, setHandover] = useState<any>();
  const id = searchParams.get("id");

  const { user } = useAuth();

useImperativeHandle(ref, () => ({
  submit: () => handleSubmit(),
  resetForm: () => {
    setFormData(initialFormData);
    setAttachments([]);
    setSelectedDocs({});
    setDocFilesMap({});
    setSelectedDocItems([]); // <-- this exists now
  },
  getStatus: () => formData?.is_locked,
  updated: () => formData?.status_of_handoversheet,
  update: () => handleEdit(),
}));

  const toDateInput = (v: any) => {
    if (!v) return "";
    if (typeof v === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      if (v.includes("T")) return v.split("T")[0];
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = { id };
        const res = await getLeadbyId(params);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };
    if (id) fetchLeads();
  }, [id]);

  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [docFilesMap, setDocFilesMap] = useState<Record<string, File>>({});
  // add this
const [selectedDocItems, setSelectedDocItems] = useState<
  Array<{ url: string; name?: string; type?: string }>
>([]);
  console.log({selectedDocItems})
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const params = { id };
        const res = await getDocuments(params);
        setDocuments(res.data || []);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };
    if (id) fetchDocuments();
  }, [id]);

  
  async function fetchAsFile(url: string, filename?: string): Promise<File> {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const blob = await res.blob();

    let name = (filename || "").trim();
    if (!name) {
      try {
        const u = new URL(url);
        const part = u.pathname.split("/").pop() || "document";
        name = decodeURIComponent(part);
      } catch {
        name = "document";
      }
    }
    if (!/\.[A-Za-z0-9]{2,5}$/.test(name)) {
      const ext = blob.type.split("/")[1] || "bin";
      name = `${name}.${ext}`;
    }
    return new File([blob], name, {
      type: blob.type || "application/octet-stream",
    });
  }


  const handleCheckboxChange = async (doc: any, checked: boolean | string) => {
    const isChecked = checked === true;

    setSelectedDocs((prev) => ({ ...prev, [doc._id]: isChecked }));

    if (isChecked) {
      try {
        if (docFilesMap[doc._id]) return;
        const file = await fetchAsFile(doc.attachment_url, doc.name);
        setAttachments((prev) => {
          const exists = prev.some(
            (f) => f.name === file.name && f.size === file.size
          );
          return exists ? prev : [...prev, file];
        });
        setDocFilesMap((prev) => ({ ...prev, [doc._id]: file }));
      } catch (e) {
        toast.error(`Couldn't attach "${doc.name}".`);
        setSelectedDocs((prev) => ({ ...prev, [doc._id]: false }));
      }
    } else {
      const file = docFilesMap[doc._id];
      if (file) {
        setAttachments((prev) =>
          prev.filter((f) => !(f.name === file.name && f.size === file.size))
        );
        setDocFilesMap((prev) => {
          const clone = { ...prev };
          delete clone[doc._id];
          return clone;
        });
      }
    }
  };

  useEffect(() => {
    const fetchHandover = async () => {
      try {
        const params = { leadId: data?.id };
        if (!params.leadId) return;
        const res = await getHandoverByLeadId(params);
        setHandover(res.data);
      } catch (err) {
        console.error("Error fetching handover:", err);
      }
    };
    fetchHandover();
  }, [data]);

  const [formData, setFormData] = useState<any>({
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
      project_completion_date: "",
      bd_commitment_date: "",
      ppa_expiry_date: "",
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
    status_of_handoversheet: "",
    is_locked: "",
    submitted_by: "",
    assigned_to: "",
  });

  // NEW: attachments (kept local; safe default)
  const [attachments, setAttachments] = useState<File[]>([]);

  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const MAX_MB = 15;
    const accepted = files.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    const rejected = files.filter((f) => f.size > MAX_MB * 1024 * 1024);

    if (rejected.length) {
      toast.warning(
        `Some files were skipped (>${MAX_MB}MB): ${rejected
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    setAttachments((prev) => [...prev, ...accepted]);
    e.currentTarget.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

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

      if (updated?.project_detail) {
        updated.project_detail.project_completion_date = toDateInput(
          updated.project_detail.project_completion_date
        );
        updated.project_detail.bd_commitment_date = toDateInput(
          updated.project_detail.bd_commitment_date
        );
        updated.project_detail.ppa_expiry_date = toDateInput(
          updated.project_detail.ppa_expiry_date
        );
      }

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

    setFormData((prev: any) => {
      const updated = { ...prev };

      if (keys.length === 2) {
        const [parent, child] = keys;
        const prevNested = updated[parent] || {};
        const newNested: any = { ...prevNested, [child]: value };

        updated[parent] = newNested;

        // compute DC capacity
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

        // compute service charge
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
        (updated as any)[name] = value;
      }

      return updated;
    });
  };

  const handleSelectChange = (path: string, value: string) => {
    const keys = path.split(".");
    setFormData((prev: any) => {
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

  const getValueByPath = (obj: any, path: string): any =>
    path.split(".").reduce((acc, part) => acc?.[part], obj);

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
      {
        name: "project_detail.ppa_expiry_date",
        label: "Completion Date *",
      },
      {
        name: "project_detail.bd_commitment_date",
        label: "BD Commitment Date *",
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

      const attachments_meta = attachments.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));
     
      const payload: any = {
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
        attachments_meta,
        documents: attachments,
      };
      console.log({attachments, payload})
      await createHandover(
        payload.id,
        payload.customer_details,
        payload.order_details,
        payload.project_detail,
        payload.commercial_details,
        payload.other_details,
        payload.invoice_detail,
        payload.submitted_by,
        payload.status_of_handoversheet,
        payload.is_locked,
        payload.documents 
      );

      toast.success("Handover Sheet Submitted Successfully");
      setFormData({
        id: payload.id,
        customer_details: payload.customer_details,
        order_details: payload.order_details,
        project_detail: payload.project_detail,
        commercial_details: payload.commercial_details,
        other_details: payload.other_details,
        status_of_handoversheet: payload.status_of_handoversheet,
        is_locked: payload.is_locked,
        submitted_by: payload.submitted_by,
      });
      setAttachments([]);
      setSelectedDocs({});
      setSelectedDocItems([]);
    } catch (error: any) {
      console.log({error})
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
        attachments_meta: attachments.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      };

      const response = await editHandover(handover?._id, payload);
      toast.success("Handover Sheet Updated Successfully");

      setFormData({
        id: payload.id,
        customer_details: payload.customer_details,
        order_details: payload.order_details,
        project_detail: payload.project_detail,
        commercial_details: payload.commercial_details,
        other_details: payload.other_details,
        submitted_by: payload.submitted_by,
      });
    } catch (error: any) {
      toast.error(error.message || "Error in Updating Handover Sheet");
    }
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
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex gap-2 items-center text-[#214b7b]">
            <FileIcon size={20} /> Handover Form
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
                    <label
                      htmlFor={name}
                      className="block mb-1 text-sm font-medium"
                    >
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
                            const selectedValue = getValueByPath(
                              formData,
                              name
                            );
                            const matchedOption = (options as any[]).find(
                              (opt: any) =>
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
                        {(options as any[]).map((opt: any) => {
                          const value =
                            typeof opt === "string" ? opt : opt.value;
                          const labelText =
                            typeof opt === "string" ? opt : opt.label;
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

                <div>
                  <label
                    htmlFor="project_detail.ppa_expiry_date"
                    className="block mb-1 text-sm font-medium"
                  >
                    PPA Expiry Date
                  </label>
                  <Input
                    type="date"
                    id="project_detail.ppa_expiry_date"
                    name="project_detail.ppa_expiry_date"
                    value={
                      getValueByPath(
                        formData,
                        "project_detail.ppa_expiry_date"
                      ) || ""
                    }
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="project_detail.bd_commitment_date"
                    className="block mb-1 text-sm font-medium"
                  >
                    BD Commitment Date
                  </label>
                  <Input
                    type="date"
                    id="project_detail.bd_commitment_date"
                    name="project_detail.bd_commitment_date"
                    value={
                      getValueByPath(
                        formData,
                        "project_detail.bd_commitment_date"
                      ) || ""
                    }
                    onChange={handleChange}
                  />
                </div>

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

            {/* ATTACHMENTS */}
            <form className="space-y-6">
              {/* === Attachments Section === */}
              <div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold flex gap-2 items-center">
                      <Paperclip size={18} /> Attachments
                    </h2>
                    <span className="text-sm text-gray-500 font-semibold">
                      Add any related files (Work Orders, LOIs, Layouts, etc.).
                      Max 15MB per file.
                    </span>
                  </div>

                  {/* ✅ Available docs on right side */}
                  {documents?.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        Available:
                      </span>
                      <div className="flex flex-wrap items-center gap-4">
                        {documents.map((doc) => (
                          <label
                            key={doc._id}
                            className="inline-flex items-center gap-2 cursor-pointer select-none"
                          >
                            <Checkbox
                              checked={!!selectedDocs[doc._id]}
                              onCheckedChange={(val) =>
                                handleCheckboxChange(doc, val)
                              }
                            />
                            <span className="text-sm uppercase">
                              {doc.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Choose Files Input */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      onChange={onPickFiles}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt"
                      className="cursor-pointer"
                    />
                  </div>

                  {/* ✅ Selected Files */}
                  {attachments.length > 0 && (
                    <div className="border rounded-md p-3">
                      <div className="text-sm font-medium mb-2">
                        Selected Files ({attachments.length})
                      </div>
                      <ul className="space-y-2">
                        {attachments.map((f, idx) => (
                          <li
                            key={`${f.name}-${idx}`}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip size={16} className="shrink-0" />
                              <span className="truncate">{f.name}</span>
                              <span className="text-gray-500 shrink-0">
                                ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(idx)}
                              className="h-8"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});
export default HandoverForm;
