import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GroupDetailForm from "../../../../src/components/group/AddGroup";
import { getGroupById } from "../../../services/group/GroupService";

interface EditGroupModalProps {
  groupId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  groupId,
  open,
  onClose,
  onSuccess,
}) => {
  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await getGroupById(groupId);
        if (result?.data) {
          const data = result.data;
          const flattened = {
            group_code: data.group_code,
            group_name: data.group_name,
            capacity: data.project_details?.capacity,
            scheme: data.project_details?.scheme,
            from: data.source?.from,
            sub_source: data.source?.sub_source,
            email: data.contact_details?.email,
            mobile: data.contact_details?.mobile || [],
            village: data.address?.village,
            district: data.address?.district,
            state: data.address?.state,
            postalCode: data.address?.postalCode,
            country: data.address?.country,
          };
          setDefaultValues(flattened);
        } else {
          setDefaultValues(null);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setDefaultValues(null);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (open && groupId) {
      fetchData();
    }
  }, [open, groupId]);

  useEffect(() => {
    if (!open) {
      setDefaultValues(null);
      setError(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Group Detail</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">Error loading group data.</p>
        ) : defaultValues ? (
          <GroupDetailForm
            key={groupId}
            isEdit
            defaultValues={defaultValues}
            groupId={groupId}
            onSuccess={onSuccess}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No group data found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupModal;
