import { useEffect, useState } from "react";
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
import { createGroup } from "@/services/group/GroupService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getGroupById } from "@/services/group/GroupService";
import { updateGroup } from "@/services/group/GroupService";
import { useAuth } from "@/services/context/AuthContext";

export default function GroupDetailForm({ groupId, onClose }) {
  const [formData, setFormData] = useState<any>({});
  const [source, setSource] = useState("");
  const [subSource, setSubSource] = useState("");
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();
  const subSourceOptions: Record<string, string[]> = {
    "Social Media": ["Instagram", "LinkedIn", "Whatsapp"],
    "Referred By": ["Directors", "Clients", "Team members", "E-mail"],
    Marketing: ["Youtube", "Advertisements"],
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const {user} = useAuth();

  const isFromGroup = location.pathname === "/groupDetail";

  useEffect(() => {
    if (!isFromGroup || !groupId) return;

    const fetchGroup = async () => {
      try {
        const res = await getGroupById(groupId);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching Group:", error);
      }
    };

    fetchGroup();
  }, [groupId, isFromGroup]);

  const handleSubmit = async (e: any) => {
    e?.preventDefault();

    const requiredFields = [
      "group_name",
      "mobile",
      "state",
      "capacity",
    ];

    const missing = requiredFields.filter((key) => !formData[key]);

    if (missing.length > 0 || !source) {
      toast.error(`Please fill all required fields.`);
      return;
    }

    const payload = {
      group_name: formData.group_name,
      contact_details: {
        email: formData.email,
        mobile: [formData.mobile, formData.altMobile].filter(Boolean),
      },
      company_name: formData.company_name,
      address: {
        village: formData.village,
        district: formData.district,
        state: formData.state,
        postalCode: formData.pincode || "",
        country: formData.country || "India",
      },
      project_details: {
        capacity: formData.capacity,
        scheme: formData.scheme,
      },
      source: {
        from: source,
        sub_source: subSource || "N/A",
      },
      createdBy: user._id,
    };

    try {
      if (isFromGroup) {
        await updateGroup({ id: groupId, data: payload });
        toast.success("Group Updated Successfully!");
      } else {
        await createGroup({ data: payload });
        toast.success("Group Created Successfully!");
      }
      onClose();
    } catch (err) {
      toast.error("Failed to submit Group");
    }
  };

  useEffect(() => {
    if (isFromGroup && data) {
      setFormData({
        company_name: data.company_name || "",
        group_name: data.group_name || "",
        email: data.contact_details?.email || "",
        mobile: data.contact_details?.mobile?.[0] || "",
        altMobile: data.contact_details?.mobile?.[1] || "",
        village: data.address?.village || "",
        district: data.address?.district || "",
        state: data.address?.state || "",
        pincode: data.address?.postalCode || "",
        country: data.address?.country || "India",
        capacity: data.project_details?.capacity || "",
        scheme: data.project_details?.scheme || "",
      });

      setSource(data.source?.from || "");
      setSubSource(data.source?.sub_source || "");
    }
  }, [data, isFromGroup]);

  return (
    <div>
      {!isFromGroup && (
        <Button
          className="cursor-pointer"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ChevronLeft />
        </Button>
      )}
      <form
        className="max-w-5xl mx-auto p-8 rounded-xl shadow-md border bg-white"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isFromGroup ? "Update Group Detail" : "Add Group Detail"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ["Company Name", "company_name", true],
            ["Group Name", "group_name", true],
            [
              "Source",
              "source",
              false,
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
            ["Village Name", "village", false],
            ["District Name", "district", false],
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
            [
              "Scheme",
              "scheme",
              false,
              "select",
              ["KUSUM A", "KUSUM C", "KUSUM C2", "Other"],
            ],
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
                    <Select
                      value={source} // ✅ controlled value
                      onValueChange={(val) => setSource(val)}
                    >
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

                  {["Marketing", "Referred By", "Social Media"].includes(
                    source
                  ) && (
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="subSource">Sub-Source</Label>
                      <Select
                        value={subSource} // ✅ This binds the selected value
                        onValueChange={setSubSource}
                      >
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
                    type={name === "capacity" ? "number" : "text"} // ✅ Force number input
                    value={formData[name as string] || ""}
                    onChange={(e) =>
                      handleChange(name as string, e.target.value)
                    }
                  />
                )}
                {type === "textarea" && (
                  <Textarea
                    id={name as string}
                    value={formData[name as string] || ""}
                    onChange={(e) =>
                      handleChange(name as string, e.target.value)
                    }
                  />
                )}
                {type === "date" && (
                  <Input
                    id={name as string}
                    type="date"
                    value={formData[name as string] || ""}
                    onChange={(e) =>
                      handleChange(name as string, e.target.value)
                    }
                  />
                )}
                {type === "select" && (
                  <Select
                    value={formData[name as string] || ""}
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
          <Button type="submit" className="cursor-pointer">
            {isFromGroup ? "Update Group" : "Create Group"}
          </Button>
        </div>
      </form>
    </div>
  );
}
