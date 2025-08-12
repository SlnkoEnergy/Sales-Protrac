import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { getLeadbyId, editBdLead } from "@/services/leads/LeadService";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/services/context/AuthContext";

export default function Edit() {
  const [formData, setFormData] = useState<any>({});
  const [source, setSource] = useState("");
  const [subSource, setSubSource] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const lead_model = searchParams.get("lead_model");

  const subSourceOptions: Record<string, string[]> = {
    "social media": ["Instagram", "LinkedIn", "Whatsapp"],
    "referred by": ["Directors", "Clients", "Team members", "E-mail"],
    marketing: ["Youtube", "Advertisements"],
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const {user} = useAuth();

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await getLeadbyId({ id, status: lead_model });
        const d = res.data;
        setFormData({
          customerName: d.c_name || "",
          companyName: d.company || "",
          groupName: d.group || "",
          email: d.email || "",
          mobile: d.mobile || "",
          altMobile: d.alt_mobile || "",
          village: d.village || "",
          district: d.district || "",
          state: d.state || "",
          capacity: d.capacity || "",
          subStationDistance: d.distance || "",
          tariff: d.tarrif || "",
          land: d.land || "",
          creationDate: d.entry_date || "",
          scheme: d.scheme || "",
          landType: d.land_type || "",
          comments: d.comment || "",
        });
        setSource(d.source || "");
        setSubSource(d.reffered_by || "");
      } catch (error) {
        console.error("Error fetching Lead:", error);
      }
    };
    fetchLead();
  }, [id, lead_model]);



  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        c_name: formData.customerName,
        email: formData.email,
        mobile: formData.mobile,
        alt_mobile: formData.altMobile,
        company: formData.companyName,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        scheme: formData.scheme,
        capacity: formData.capacity,
        distance: formData.subStationDistance,
        tarrif: formData.tariff,
        land: formData.land,
        entry_date: formData.creationDate,
        interest: "",
        comment: formData.comments,
        loi: "",
        ppa: "",
        loa: "",
        other_remarks: "",
        submitted_by: user?.name,
        token_money: "",
        group: formData.groupName,
        reffered_by: subSource || "",
        source: source,
        remark: "",
      };

      const queryParams = {
        _id: id,
        lead_model: lead_model,
      };

      await editBdLead(queryParams, payload);
      toast.success("Lead Updated Successfully!");
      navigate(`/leadProfile?id=${id}&status=${lead_model}`);
    } catch (err) {
      toast.error("Failed to update Lead");
    }
  };

  return (
    <div>
      <Button className="cursor-pointer" onClick={() => navigate(-1)}>
        <ChevronLeft />
      </Button>
      <form
        className="max-w-5xl mx-auto p-8 rounded-xl shadow-md border bg-white"
        onSubmit={handleUpdate}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Edit Lead</h2>
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
              ["Kusum A", "Kusum C", "Kusum C2", "Other"],
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
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {(options as string[]).map((opt, i) => (
                          <SelectItem value={opt.toLowerCase()} key={i}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {["marketing", "referred by", "social media"].includes(
                    source
                  ) && (
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="subSource">Sub-Source</Label>
                      <Select value={subSource} onValueChange={setSubSource}>
                        <SelectTrigger id="subSource">
                          <SelectValue placeholder="Select Sub-Source" />
                        </SelectTrigger>
                        <SelectContent>
                          {subSourceOptions[source]?.map((sub, idx) => (
                            <SelectItem key={idx} value={sub.toLowerCase()}>
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
                  {required && <span className="text-red-500"> *</span>}
                </Label>

                {type === "input" && (
                  <Input
                    id={name as string}
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
                    type="date"
                    id={name as string}
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
                        <SelectItem value={opt.toLowerCase()} key={i}>
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
            Update Lead
          </Button>
        </div>
      </form>
    </div>
  );
}
