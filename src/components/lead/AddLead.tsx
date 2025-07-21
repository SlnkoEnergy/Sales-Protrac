import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createBdLead } from "@/services/leads/LeadService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function AddLead() {
  const [formData, setFormData] = useState<any>({});
  const [source, setSource] = useState("");
  const [subSource, setSubSource] = useState("");
  const navigate = useNavigate();
  const subSourceOptions: Record<string, string[]> = {
    "Social Media": ["Instagram", "LinkedIn", "Whatsapp"],
    "Referred By": ["Directors", "Clients", "Team members", "E-mail"],
    Marketing: ["Youtube", "Advertisements"],
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
  const requiredFields = [
    "customerName",
    "groupName",
    "mobile",
    "village",
    "district",
    "state",
    "capacity",
    "creationDate",
    "comments",
  ];

  const missing = requiredFields.filter((key) => !formData[key]);

  if (missing.length > 0 || !source) {
    toast.error(`Please fill all required fields.`);
    return;
  }
    try {
   const payload = {
  name: formData.customerName,
  contact_details: {
    email: formData.email,
    mobile: [formData.mobile, formData.altMobile].filter(Boolean),
  },
  company_name: formData.companyName,

  address: {

    district: formData.district,
    state: formData.state,
    postalCode: formData.pincode || "",
    country: formData.country || "India",
  },

  project_details: {
    capacity: formData.capacity,
    distance_from_substation: {
      value: formData.subStationDistance,
      unit: "km",
    },
    available_land: {
      value: formData.land,
      unit: "km",
    },
    tarrif: formData.tariff,
    scheme: formData.scheme,
    land_type: formData.landType || "Owned",
  },

  source: {
  from: source,
  sub_source: subSource || "",
},


  comments: formData.comments,
  current_status: {
    name: "initial",
  },
  submitted_by: getCurrentUser()._id,

  documents: [],
  token_money: "",
  interest: "",
};


      await createBdLead({ data: payload });
      toast.success("Lead Created Successfully!");
      navigate("/leads");
    } catch (err) {
      toast.error("Failed to create Lead");
    }
  };

  return (
    <div>
      <Button
        className="cursor-pointer"
        onClick={() => {
          navigate(-1);
        }}
      >
        <ChevronLeft />
      </Button>
      <form
        className="max-w-5xl mx-auto p-8 rounded-xl shadow-md border bg-white"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Lead</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ["Customer Name", "customerName", true],
            ["Company Name", "companyName", false],
            ["Group Name", "groupName", false],
            [
              "Source",
              "source",
              true,
              "select",
              [
                "Marketing",
                "Referred By",
                "Social Media",
                "IVR/My Operator",
                "Others",
              ],
            ],
            ["Email ID", "email", false],
            ["Mobile Number", "mobile", true],
            ["Alt Mobile Number", "altMobile", false],
            ["Village Name", "village", true],
            ["District Name", "district", true],
            [
              "Select State",
              "state",
              true,
              "select",
              [
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
              ],
            ],
            ["Capacity", "capacity", true],
            ["Sub Station Distance (KM)", "subStationDistance", false],
            ["Tariff (Per Unit)", "tariff", false],
            ["Available Land (acres)", "land", false],
            ["Creation Date", "creationDate", true, "date"],
            [
              "Scheme",
              "scheme",
              false,
              "select",
              ["KUSUM A", "KUSUM C", "KUSUM C2", "Other"],
            ],
            ["Land Types", "landType", false, "select", ["Leased", "Owned"]],
            ["Comments", "comments", true, "textarea"],
          ].map(([label, name, required, type = "input", options], idx) => {
            const isSource = name === "source";
            if (isSource) {
              return (
                <div
                  key={idx}
                  className="md:col-span-2 flex flex-col md:flex-row gap-4"
                >
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="source">
                      Source<span className="text-red-500"> *</span>
                    </Label>
                    <Select onValueChange={(val) => setSource(val)}>
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {(options as string[]).map((opt, i) => (
                          <SelectItem value={opt} key={i}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {["Marketing", "Referred By", "Social Media"].includes(source) && (
  <div className="flex-1 space-y-1.5">
    <Label htmlFor="subSource">Sub-Source</Label>
    <Select onValueChange={setSubSource}>
      <SelectTrigger id="subSource">
        <SelectValue placeholder="Select Sub-Source" />
      </SelectTrigger>
      <SelectContent>
        {subSourceOptions[source]?.map((sub, idx) => (
          <SelectItem key={idx} value={sub}>
            {sub}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}

                </div>
              );
            }

            return (
              <div key={idx} className="space-y-1.5">
                <Label htmlFor={name as string}>
                  {label}
                  {required ? <span className="text-red-500"> *</span> : null}
                </Label>

                {type === "input" && (
                  <Input
                    id={name as string}
                    onChange={(e) =>
                      handleChange(name as string, e.target.value)
                    }
                  />
                )}
                {type === "textarea" && (
                  <Textarea
                    id={name as string}
                    onChange={(e) =>
                      handleChange(name as string, e.target.value)
                    }
                  />
                )}
                {type === "date" && (
                  <Input
                    id={name as string}
                    type="date"
                    onChange={(e) =>
                      handleChange(name as string, e.target.value)
                    }
                  />
                )}
                {type === "select" && (
                  <Select
                    onValueChange={(val) => handleChange(name as string, val)}
                  >
                    <SelectTrigger id={name as string}>
                      <SelectValue placeholder={label} />
                    </SelectTrigger>
                    <SelectContent>
                      {(options as string[]).map((opt, i) => (
                        <SelectItem value={opt} key={i}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Button type="submit" className="cursor-pointer">Submit</Button>
        </div>
      </form>
    </div>
  );
}