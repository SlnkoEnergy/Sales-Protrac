import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createBdLead, getAllGroupName } from "@/services/leads/LeadService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export type GroupName = {
  _id: string;
  group_code: string;
  group_name: string;
  source: {
    from: string;
    sub_source: string;
  };
  contact_details: {
    email: string;
    mobile: string[];
  };
  address: {
    village: string;
    district: string;
    state: string;
  };
  project_details: {
    scheme: string;
  };
  current_status: {
    status: string;
  };
};

export default function AddLead() {
  const [formData, setFormData] = useState<any>({});
  const [source, setSource] = useState("");
  const [subSource, setSubSource] = useState("");
  const [showGroupDropDown, setShowGroupDropDown] = useState(false);
  const [data, setData] = useState<GroupName[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupName | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = data.filter(
  (grp) =>
    (
      grp.group_code?.toLowerCase().includes(search?.toLowerCase()) ||
      grp.group_name?.toLowerCase().includes(search?.toLowerCase())
    ) &&
    grp.current_status?.status?.toLowerCase() !== "closed"
);

  const subSourceOptions: Record<string, string[]> = {
    "Social Media": ["Instagram", "LinkedIn", "Whatsapp"],
    "Referred By": ["Directors", "Clients", "Team members", "E-mail"],
    Marketing: ["Youtube", "Advertisements"],
  };
  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => {
      if (key === "source") {
        return {
          ...prev,
          source: value,
          sub_source: "", // reset sub_source on source change
        };
      }
      return { ...prev, [key]: value };
    });
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

    try {
      const payload = {
        name: formData.customerName,
        group_id: formData.groupcode || undefined,
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
          village: formData.village,
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
          sub_source: subSource || " ",
        },
        comments: formData.comments,
        submitted_by: getCurrentUser()._id,
        documents: [],
      };

      await createBdLead({ data: payload });
      toast.success("Lead Created Successfully!");
      navigate("/leads");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllGroupName();
      setData(res.data.data);
    };
    fetchData();
  }, []);

  console.log({ data });

  return (
    <div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>

        <Button
          type="submit"
          className="cursor-pointer bg-[#214b7b]"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>

      <form
        className="max-w-5xl mx-auto p-8 rounded-xl shadow-md border bg-white"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Lead</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ["Customer Name", "customerName", true],
            ["Company Name", "companyName", false],
            ["Group Code", "groupcode", false, "select"],
            showGroupDropDown && ["Group Name", "groupname", false],
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
            ["Capacity(MW)", "capacity", true],
            ["Sub Station Distance (km)", "subStationDistance", false],
            ["Tariff (Per Unit)", "tariff", false],
            ["Available Land (Acres)", "land", false],
            [
              "Scheme",
              "scheme",
              false,
              "select",
              ["KUSUM A", "KUSUM C", "KUSUM C2", "Other"],
            ],
            ["Land Types", "landType", false, "select", ["Leased", "Owned"]],
            ["Comments", "comments", true, "textarea"],
          ]
            .filter(Boolean)
            .map(([label, name, required, type = "input", options], idx) => {
              const isSource = name === "source";

              if (isSource) {
                return (
                  <div
                    key={idx}
                    className="md:col-span-2 flex flex-col md:flex-row gap-4"
                  >
                    {/* Source */}
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="source">
                        Source<span className="text-red-500"> *</span>
                      </Label>
                      <Select
                        value={formData.source || " "}
                        onValueChange={(val) => {
                          handleChange("source", val);
                          handleChange("sub_source", "");
                          setSource(val); // ✅ this is needed for correct payload
                          setSubSource("");
                        }}
                        disabled={!!selectedGroup}
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

                    {/* Sub-Source */}
                    {formData.source && subSourceOptions[formData.source] && (
                      <div className="flex-1 space-y-1.5">
                        <Label htmlFor="sub_source">Sub-Source</Label>
                        <Select
                          value={formData.sub_source || " "}
                          onValueChange={(val) => {
                            handleChange("sub_source", val);
                            setSubSource(val);
                          }}
                          disabled={!!selectedGroup}
                        >
                          <SelectTrigger id="sub_source">
                            <SelectValue placeholder="Select Sub-Source" />
                          </SelectTrigger>
                          <SelectContent>
                            {subSourceOptions[formData.source].map(
                              (sub, idx) => (
                                <SelectItem key={idx} value={sub}>
                                  {sub}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex flex-row space-x-2">
                    <Label htmlFor={name as string}>
                      {label}
                      {required && <span className="text-red-500"> *</span>}
                    </Label>
                    {label === "Group Code" && (
                      <Switch
                        id="enable-group"
                        checked={showGroupDropDown}
                        onCheckedChange={(val) => {
                          setShowGroupDropDown(val);

                          if (!val) {
                            // Clear populated data
                            setSelectedGroup(null);
                            handleChange(name as string, "");
                            handleChange("groupname", "");

                            setFormData((prev: any) => ({
                              ...prev,
                              email: "",
                              mobile: "",
                              altMobile: "",
                              district: "",
                              state: "",
                              village: "",
                              scheme: "",
                              source: "",
                              sub_source: "",
                            }));

                            setSource("");
                            setSubSource("");
                          }
                        }}
                      />
                    )}
                  </div>

                  {type === "input" && name !== "groupname" && (
                    <Input
                      id={name as string}
                      type={name === "capacity" ? "number" : "text"}
                      value={formData[name as string] || ""}
                      onChange={(e) =>
                        handleChange(name as string, e.target.value)
                      }
                      disabled={
                        name !== "capacity" &&
                        name !== "customerName" &&
                        name !== "subStationDistance" &&
                        name !== "tariff" &&
                        name !== "land" &&
                        !!selectedGroup
                      }
                    />
                  )}

                  {type === "input" && name === "groupname" && (
                    <Input
                      className="mt-2.5 min-h-11"
                      id="groupcode"
                      value={selectedGroup?.group_name || ""}
                      disabled
                      placeholder="Group Name"
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
                      type="date"
                      id={name as string}
                      onChange={(e) =>
                        handleChange(name as string, e.target.value)
                      }
                    />
                  )}

                  {type === "select" &&
                    name === "groupcode" &&
                    showGroupDropDown && (
                      <Select
                        onValueChange={(val) => {
                          const group = data.find((g) => g._id === val);
                          setSelectedGroup(group || null);
                          handleChange(name as string, val);
                          handleChange("groupname", group?.group_name || "");

                          if (group) {
                            setFormData((prev: any) => ({
                              ...prev,
                              email: group.contact_details?.email || "",
                              mobile: group.contact_details?.mobile[0] || "",
                              altMobile: group.contact_details?.mobile[1] || "",
                              district: group.address?.district || "",
                              state: group.address?.state || "",
                              village: group.address?.village || "",
                              scheme: group.project_details?.scheme || "",
                              source: group.source.from || "",
                              sub_source: group.source.sub_source || "",
                              companyName: group?.company_name || "",
                            }));

                            setSource(group.source.from || "");
                            setSubSource(group.source.sub_source || "");
                          }
                        }}
                      >
                        <SelectTrigger id={name as string}>
                          <SelectValue placeholder={label} />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          side="bottom"
                          align="start"
                          className="z-[999] max-h-80 overflow-y-auto w-full min-w-[468px]"
                        >
                          <div>
                            <Input
                              placeholder="search group..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                          <SelectGroup>
                            { filtered.length > 0 ? (
                              filtered.map((group) =>(
                                <SelectItem key={group._id} value={group._id}>
                                {group.group_code}- {group.group_name}
                              </SelectItem>
                              ))
                            ):(
                              <div className="px-2 py-2 text-sm text-muted-foreground">
                                    No group found
                                  </div>
                            )
                            }
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}

                  {type === "select" && name !== "groupcode" && (
                    <Select
                      onValueChange={(val) => handleChange(name as string, val)}
                      value={formData[name as string] || ""}
                      disabled={name !== "landType" && !!selectedGroup}
                    >
                      <SelectTrigger id={name as string}>
                        <SelectValue placeholder={label} />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        className="z-[999] max-h-80 overflow-y-auto w-full min-w-[468px]"
                      >
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
      </form>
    </div>
  );
}
